import {Shape} from "./Shape";
import {Position} from "./Position";
import {Matrix} from "./Matrix";

/**
 * Rectangle area on coordinate system. Use static factory methods `rectangleByTwoPoints()` and
 * `rectangleByOnePoint()` to initialize new instance
 */
export class Rectangle {

	/**
	 * Top left rectangle point position
	 */
	topLeft: Position;

	/**
	 * Top right rectangle point position
	 */
	bottomRight: Position;

	/**
	 * Rectangle shape
	 */
	shape: Shape;

	/**
	 * Construct new Rectangle instance. Constructor is private. Use static factory methods `rectangleByTwoPoints()` and
	 * `rectangleByOnePoint()`
	 * @param p
	 * @param shape
	 */
	private constructor(p: Position, shape: Shape) {
		this.topLeft = p;
		this.shape = shape;

		this.bottomRight = new Position(this.topLeft.x + this.shape.width, this.topLeft.y + this.shape.height);
	}

	translate(position: Position): Rectangle {
		return new Rectangle(this.topLeft.add(position), this.shape);
	}

	/**
	 * Only for integer point positions and shapes
	 */
	matrix(): Matrix<Position> {
		return new Matrix<Position>(new Shape(
			this.shape.width + 1,
			this.shape.height + 1
			),
			null,
			new Position(0, 0)
		).map((position, positionPosition) => {
			return position.add(positionPosition)
		});
	}

	/**
	 * Define rectangle by two points
	 * @param p1 upper left point
	 * @param p2 bottom right point
	 */
	static rectangleByTwoPoints(p1: Position, p2: Position): Rectangle {
		if (p1.x > p2.x || p1.y > p2.y) {
			[p1, p2] = [p2, p1];
		}

		const width = p2.x - p1.x;
		const height = p2.y - p1.y;
		return new Rectangle(p1, new Shape(width, height));
	}

	/**
	 * Define rectangle by one point
	 * @param p1 upper left point
	 * @param shape rectangle shape
	 */
	static rectangleByOnePoint(p1: Position, shape: Shape): Rectangle {
		return new Rectangle(p1, shape);
	}

}