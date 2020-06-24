// module aliases
var Engine = Matter.Engine,
	Render = Matter.Render,
	Composite = Matter.Composite,
	Composites = Matter.Composites,
	World = Matter.World,
	Constraint = Matter.Constraint,
	Runner = Matter.Runner,
	Events = Matter.Events,
	Vector = Matter.Vector,
	Body = Matter.Body,
	MouseConstraint = Matter.MouseConstraint,
	Mouse = Matter.Mouse,
	Bodies = Matter.Bodies;

// PID variables
const params = new URLSearchParams(window.location.search);
var Kp = params.get("kp") || 0;
var Ki = params.get("ki") || 0;
var Kd = params.get("kd") || 0;
document.getElementById("kp").value = Kp;
document.getElementById("ki").value = Ki;
document.getElementById("kd").value = Kd;

// create engine, world, runner
var engine = Engine.create(),
	runner = Runner.create(),
	world = engine.world;

// alias timestep for PID
engine.timing.isFixed = true;
const dt = runner.delta;

// create renderer
var render = Render.create({
	element: document.getElementById("world"),
	engine: engine,
	options: {
		width: 800,
		height: 600,
		showAxes: true,
		wireframes: false,
		background: "white",
	}
});

// add floor
World.add(world, [
	Bodies.rectangle(50000, 600, 100000, 50, { isStatic: true })
]);

// create cart-pendulum system
var cart = Composites.car(50000, 570, 150, 30, 30);
var pendulum = Bodies.circle(50000, 180, 15, 15);
var pole = Constraint.create({
		bodyA: cart.bodies[0],
		bodyB: pendulum,
		render: {
			strokeStyle: "black"
		}
	});
World.add(world, [
	cart,
	pendulum,
	pole
]);

// initialize PID variables
var previous_err = 0;
var integral = 0;
var setpoint = -Math.PI/2;

// graph to help tune PID
var time = 0;
var dps = [];
var chart = new CanvasJS.Chart("graph", {
	axisX: {
		title: "Time (ms)"
	},
	axisY: {
		title: "error (rad)"
	},
	data: [{
		type: "line",
		dataPoints: dps
	}]
});

// create PID
Events.on(engine, "afterUpdate", function(event) {
	var err = setpoint - Vector.angle(cart.bodies[0].position, pendulum.position);
	dps.push({ x: time, y: err });
	time = time + dt;
	chart.render();
	integral = integral + err*dt;
	var derivative = (err - previous_err) / dt;
	var output = -(Kp*err + Ki*integral + Kd*derivative);
	Body.setAngularVelocity(cart.bodies[1], output);
	Body.setAngularVelocity(cart.bodies[2], output);
	previous_err = err;
	Render.lookAt(render, [pole, cart, pendulum], { x: 800, y: 300 });
});

// it's more fun to manually create perturbations
var mouse = Mouse.create(render.canvas),
	mouseConstraint = MouseConstraint.create(engine, {
		mouse: mouse,
		constraint: {
			stiffness: 0.001
		}
	});
World.add(world, mouseConstraint);
render.mouse = mouse;

// run engine and renderer
var runner = Engine.run(engine);
Render.run(render);
