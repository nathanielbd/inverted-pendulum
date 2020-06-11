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
	Bodies = Matter.Bodies;

// create engine, world, runner
var engine = Engine.create(),
	runner = Runner.create(),
	world = engine.world;

// alias timestep for PID
engine.timing.isFixed = true;
const dt = runner.delta;

// create renderer
var render = Render.create({
	element: document.body,
	engine: engine,
	options: {
		width: 3000,
		height: 600,
		showAxes: true
	}
});

// add walls
World.add(world, [
	Bodies.rectangle(1500, 0, 3000, 50, { isStatic: true }),
	Bodies.rectangle(1500, 600, 3000, 50, { isStatic: true }),
	Bodies.rectangle(3000, 300, 50, 600, { isStatic: true }),
	Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
]);

// create cart-pendulum system
var cart = Composites.car(1500, 570, 150, 30, 30);
var pendulum = Bodies.circle(1500, 180, 15, 15);
World.add(world, [
	cart,
	pendulum,
	Constraint.create({
		bodyA: cart.bodies[0],
		bodyB: pendulum
	})
]);

// initialize PID variables
var previous_err = 0;
var integral = 0;
var setpoint = -Math.PI/2;
const Kp = 1;
const Ki = 0.02;
const Kd = 20;

// graph to help tune PID
var time = 0;
var dps = [];
var chart = new CanvasJS.Chart("graph", {
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
});

// run engine and renderer
Engine.run(engine);
Render.run(render);
