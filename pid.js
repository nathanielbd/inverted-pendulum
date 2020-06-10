// module aliases
var Engine = Matter.Engine,
	Render = Matter.Render,
	Composite = Matter.Composite,
	Composites = Matter.Composites,
	World = Matter.World,
	Constraint = Matter.Constraint,
	Bodies = Matter.Bodies;

// create engine and renderer
var engine = Engine.create(),
	world = engine.world;
var render = Render.create({
	element: document.body,
	engine: engine
});

// create collision-filtering categories
var defaultCategory = 0x0001,
	sysCategory = 0x0002;

// create cart-pendulum system
var cart = Composites.car(400, 570, 150, 30, 30, { 
	collisionFilter: {
		category: sysCategory,
		mask: defaultCategory
	}
});
var pendulum = Bodies.rectangle(400, 480, 15, 200, {
	collisionfiler: {
		category: sysCategory,
		mask: defaultCategory
	},
	chamfer: 5
});
Composite.add(cart, pendulum);
Composite.add(cart, Constraint.create({
	bodyB: pendulum,
	pointA: { x: 400, y: 570 },
	length: 0
}));

// add walls
World.add(world, [
	cart,
	pendulum,
	Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
	Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
	Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
	Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
]);

// run engine and renderer
Engine.run(engine);
Render.run(render);
