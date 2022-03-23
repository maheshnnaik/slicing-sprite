import { _decorator, Vec2, Vec3, v3, UITransform } from 'cc';
const { ccclass, property } = _decorator;

export default class LineIntersection {

	static updateBoundsAndGetIntersection(transform: UITransform, pos: Vec3, rotation: number, scale: Vec3, startPoint: Vec3, endPoint: Vec3) {
		let center = transform.getBoundingBox().center;

		let spriteLines: Vec3[][] = [];
		let minX = -((transform.width / 2) * scale.x) + pos.x;
		let minY = -((transform.height / 2) * scale.y) + pos.y;
		let maxX = ((transform.width / 2) * scale.x) + pos.x;
		let maxY = ((transform.height / 2) * scale.y) + pos.y;

		spriteLines.splice(0, spriteLines.length);
		spriteLines.push([v3(minX, minY), v3(maxX, minY)]);
		spriteLines.push([v3(maxX, minY), v3(maxX, maxY)]);
		spriteLines.push([v3(maxX, maxY), v3(minX, maxY)]);
		spriteLines.push([v3(minX, maxY), v3(minX, minY)]);
		// console.log(spriteLines);
		spriteLines = this.updateBoundCoordinates(spriteLines, rotation, center);
		let boundCoordinates: Vec3[] = [];
		spriteLines.forEach((line) => {
			boundCoordinates.push(line[0]);
		});
		let finalRect = this.checkIntersection(startPoint, endPoint, spriteLines);
		if (finalRect.length > 2) {
			if (this.compareAreas(boundCoordinates, finalRect)) {
				for (let i = 0; i < finalRect.length; i++) {
					let x = finalRect[i].x;
					let y = finalRect[i].y;
					finalRect[i] = this.getTranslatedCoordinate(x, y, -rotation, center);
				}
				return finalRect;
			}
		}
		return [];
	}

	static checkIntersection(startPoint: Vec3, endPoint: Vec3, spriteLines: Vec3[][]) {
		var points: Vec3[] = [];
		let unIntersectedLines: Vec3[][] = [];
		for (let i = 0; i < spriteLines.length; i++) {
			let line = spriteLines[i];
			let p = this.calculateIntersection(startPoint, endPoint, line[0], line[1]);
			if (p) {
				points.push(p);
			} else {
				unIntersectedLines.push(line);
			}
		}
		// console.log("intersection points: ", points);
		if (points.length == 1) {
			let start = this.isInsideRect(startPoint, spriteLines);
			let end = this.isInsideRect(endPoint, spriteLines);
			// console.log("start point: ", start);
			// console.log("end point: ", end);
			let lengthToPoint: number;
			if(start){
				lengthToPoint = this.getDistance(points[0], startPoint);
				// console.log("length: ", lengthToPoint);
			}else if(end){
				lengthToPoint = this.getDistance(points[0], endPoint);
			}
			for (let j = 0; j < unIntersectedLines.length; j++) {
				let uLine = unIntersectedLines[j];
				let intersectionPoint = this.checkForAnotherIntersection(startPoint, endPoint, uLine[0], uLine[1]);
				if (intersectionPoint) {
					// console.log("intersection point: ", intersectionPoint);
					points.push(intersectionPoint);
					break;
				}
			}
			let l = this.getDistance(points[0], points[1]);
			// console.log("length: ", lengthToPoint, "total length: ", l, "length ratio: ", (lengthToPoint / l))
			if(Math.round((lengthToPoint / l) * 100) < 10){
				return [];
			}
		}
		if (points.length == 2) {
			points = this.getFinalRect(points, spriteLines);
		}

		return points;
	}
	static updateBoundCoordinates(spriteLines: Vec3[][], rotation: number, center: Vec2) {
		let length = spriteLines.length;
		for (let i = 0; i < length; i++) {
			var x = spriteLines[i][0].x;
			var y = spriteLines[i][0].y;

			spriteLines[i][0] = this.getTranslatedCoordinate(x, y, rotation, center);

			if (i > 0) {
				spriteLines[i - 1][1].x = spriteLines[i][0].x;
				spriteLines[i - 1][1].y = spriteLines[i][0].y;
			}
		}
		spriteLines[length - 1][1].x = spriteLines[0][0].x;
		spriteLines[length - 1][1].y = spriteLines[0][0].y;
		return spriteLines;
	}

	// https://gamedev.stackexchange.com/questions/86755/how-to-calculate-corner-positions-marks-of-a-rotated-tilted-rectangle
	static getTranslatedCoordinate(x: number, y: number, rotation: number, center: Vec2) {
		var tempX = x - center.x;
		var tempY = y - center.y;

		// now apply rotation
		var rotatedX = tempX * Math.cos(rotation * (Math.PI / 180)) - tempY * Math.sin(rotation * (Math.PI / 180));
		var rotatedY = tempX * Math.sin(rotation * (Math.PI / 180)) + tempY * Math.cos(rotation * (Math.PI / 180));

		// translate back
		x = parseFloat((rotatedX + center.x).toFixed(3));
		y = parseFloat((rotatedY + center.y).toFixed(3));
		return v3(x, y);
	}

	static getFinalRect(points: Vec3[], spriteLines: Vec3[][]) {
		var finalRect: Vec3[] = [];
		var boundingLines = spriteLines;
		var intersectingLines = this.getIntersectingLines(points, boundingLines);

		let commonPoint = this.checkForCommonPoint(intersectingLines);
		if (commonPoint) {
			finalRect.push(commonPoint);
			points.forEach((line) => {
				finalRect.push(line);
			});
		}
		else {
			finalRect.push(boundingLines[0][0]);
			for (let j = 0; j < boundingLines.length; j++) {
				let line = boundingLines[j];
				if (this.checkIfPointOnLine(points[0], line)) {
					finalRect.push(points[0]);
					j++;
				} else if (this.checkIfPointOnLine(points[1], line)) {
					finalRect.push(points[1]);
					j++;
				}
				else {
					finalRect.push(line[1]);
				}
			}
			if (finalRect.length == 3) {
				finalRect.push(boundingLines[3][0]);
			}
		}
		return finalRect;
	}
	static checkForCommonPoint(intersectingLines: Vec3[][]) {
		let commonPoint: Vec3;
		for (let i = 0; i < intersectingLines.length - 1; i++) {
			let line1 = intersectingLines[i];
			let line2 = intersectingLines[i + 1];
			commonPoint = this.calculateIntersection(line1[0], line1[1], line2[0], line2[1]);
			if (commonPoint) {
				// console.log("common point: ", commonPoint);
				return commonPoint;
			}
		}
		return commonPoint;
	}

	static getIntersectingLines(points: Vec3[], boundingLines: Vec3[][]) {
		let intersectingLines: Vec3[][] = [];
		for (let i = 0; i < points.length; i++) {
			let point = points[i];
			for (let j = 0; j < boundingLines.length; j++) {
				var line = boundingLines[j];
				if (this.checkIfPointOnLine(point, line)) {
					intersectingLines.push(line);
					break;
				}
			}
		}
		return intersectingLines;
	}
	static checkIfPointOnLine(point: Vec3, line: Vec3[]) {
		var p1 = line[0];
		var p2 = line[1];
		var slope = (p2.y - p1.y) / (p2.x - p1.x);
		if (slope == Infinity || slope == -Infinity) {
			let d = this.getDistance(p1, p2);
			let d1 = this.getDistance(p1, point);
			let d2 = this.getDistance(point, p2);
			if (Math.fround(d) == Math.fround(d1 + d2)) {
				return true;
			} else {
				return false;
			}
		}
		var intercept = p1.y - (slope * p1.x);
		var y = (slope * point.x) + intercept;
		if (Math.round(y) === Math.round(point.y)) {
			return true;
		} else {
			return false;
		}
	}
	/*
			_______
		   |       |
		   |_______|
	*/
	// https://dirask.com/posts/JavaScript-calculate-intersection-point-of-two-lines-for-given-4-points-VjvnAj
	static calculateIntersection(p1: Vec3, p2: Vec3, p3: Vec3, p4: Vec3) {

		// // down part of intersection point formula
		var d1 = (p1.x - p2.x) * (p3.y - p4.y); // (x1 - x2) * (y3 - y4)
		var d2 = (p1.y - p2.y) * (p3.x - p4.x); // (y1 - y2) * (x3 - x4)
		var d = (d1) - (d2);

		if (d == 0) {
			return;
			throw new Error('Number of intersection points is zero or infinity.');
		}

		// // upper part of intersection point formula
		var u1 = (p1.x * p2.y - p1.y * p2.x); // (x1 * y2 - y1 * x2)
		var u4 = (p3.x * p4.y - p3.y * p4.x); // (x3 * y4 - y3 * x4)

		var u2x = p4.x - p3.x; // (x3 - x4)
		var u3x = p2.x - p1.x; // (x1 - x2)
		var u2y = p4.y - p3.y; // (y3 - y4)
		var u3y = p2.y - p1.y; // (y1 - y2)

		var s: number, t: number;
		s = (-u3y * (p1.x - p3.x) + u3x * (p1.y - p3.y)) / (-u2x * u3y + u3x * u2y);
		t = (u2x * (p1.y - p3.y) - u2y * (p1.x - p3.x)) / (-u2x * u3y + u3x * u2y);

		// // intersection point formula
		if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
			var px = -(u1 * u2x - u3x * u4) / d;
			var py = -(u1 * u2y - u3y * u4) / d;

			var p = v3(parseFloat(px.toFixed(3)), parseFloat(py.toFixed(3)));

			return p;
		} else {
			return;
		}
	}

	// https://jsfiddle.net/justin_c_rounds/Gd2S2/light/
	static checkForAnotherIntersection(p1: Vec3, p2: Vec3, p3: Vec3, p4: Vec3) {
		// if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
		var denominator: number, a: number, b: number, numerator1: number, numerator2: number;
		denominator = ((p4.y - p3.y) * (p2.x - p1.x)) - ((p4.x - p3.x) * (p2.y - p1.y));
		if (denominator == 0) {
			return;
		}
		a = p1.y - p3.y;
		b = p1.x - p3.x;
		numerator1 = ((p4.x - p3.x) * a) - ((p4.y - p3.y) * b);
		numerator2 = ((p2.x - p1.x) * a) - ((p2.y - p1.y) * b);
		a = numerator1 / denominator;
		b = numerator2 / denominator;

		// if line2 is a segment and line1 is infinite, they intersect if:
		if (b > 0 && b < 1) {
			// if we cast these lines infinitely in both directions, they intersect here:
			let x = parseFloat((p1.x + (a * (p2.x - p1.x))).toFixed(3));
			let y = parseFloat((p1.y + (a * (p2.y - p1.y))).toFixed(3));
			return v3(x, y);
		}
		else {
			return;
		}
		// if line1 is a segment and line2 is infinite, they intersect if:
		// if (a > 0 && a < 1) {
		// 	result.onLine1 = true;
		// }
		// if line1 and line2 are segments, they intersect if both of the above are true

	};

	static compareAreas(boundCoordinates: Vec3[], finalRectCoordinates: Vec3[]) {
		let area = this.polygonArea(boundCoordinates);
		let finalRectArea = this.polygonArea(finalRectCoordinates);
		let percent = Math.round((finalRectArea / area) * 100);
		// console.log("area: ", area, "final rect area: ", finalRectArea, `${percent}%`, (percent >= 15 && percent <= 85));
		return (percent >= 5 && percent <= 95);
	}

	// https://www.geeksforgeeks.org/area-of-a-polygon-with-given-n-ordered-vertices/
	static polygonArea(coordinates: Vec3[]) {
		let area = 0.0;
		// Calculate value of shoelace formula
		let j = coordinates.length - 1;
		for (let i = 0; i < coordinates.length; i++) {
			area += (coordinates[j].x + coordinates[i].x) * (coordinates[j].y - coordinates[i].y);
			// j is previous vertex to i
			j = i;
		}
		// Return absolute value
		return Math.abs(area / 2.0);
	}
	static isInsideRect(point: Vec3, bounds: Vec3[][]){
		let boundCoordinates: Vec3[] = [];
		bounds.forEach((line) => {
			boundCoordinates.push(line[0]);
		}); 
		let boundArea = this.polygonArea(boundCoordinates);
		let area = 0;
		bounds.forEach((line)=>{
			let t = [point, line[0], line[1]];
			area += this.polygonArea(t);
		})
		if(Math.round(area) == Math.round(boundArea)){
			return true;
		}else{
			return false;
		}
	}

	static getDistance(p1: Vec3, p2: Vec3){
		let d = Math.sqrt(Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2));
		return d;
	}
}