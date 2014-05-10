var impress = impress();

if ("ontouchstart" in document.documentElement) { 
	document.querotateYSelector(".hint").innerHTML = "<p>Tap on the left or right to navigate</p>";
}

impress.init({
	steps: {
		//back
		slide1: 	{ x: -125, z: -150, rotate: 90, scale: 0.5 },
		slide2: 	{ x: 125, z: -150, rotate: 90, scale: 0.5 },

		//right
		slide3: 	{ x: 500, y: 0, z: 125, rotateY: -90, scale: 0.5 },
		slide4: 	{ x: 525, y: 25, z: 125, rotateY: -90, scale: 0.5 },
		
		//top
		slide5: 	{ x: 125, y: -350, z: 250, rotateX: -90, rotateZ: -90, scale: 0.5 },
		slide6: 	{ x: -125, y: -350, z: 250, rotateX: -90, rotateZ: -90, scale: 0.5 },

		//left
		slide7: 	{ x: -400, y: 125, z: 250, rotateY: 90, rotateZ: 180, scale: 0.5 },
		slide8: 	{ x: -400, y: -125, z: 250, rotateY: 90, rotateZ: 180, scale: 0.5 },
		
		//front
		slide9: 	{ x: -125, y: 0, z: 650, rotateY: 180, scale: 0.5 },
		slide10: 	{ x: 125, y: 0, z: 650, rotateY: 180, scale: 0.5 },

		//bottom
		slide11: 	{ x: -125, y: 400, z: 250, rotateX: 90, rotateZ: -90,	scale: 0.5 },
		slide12: 	{ x: 125, y: 400, z: 250, rotateX: 90, rotateZ: -90,	scale: 0.5 },

		slide13: 	{ z: 3000, scale: 3 },
		slide14: 	{ z: 6000, scale: 5 },

		// I don't know why I did this, but it works
		slide15: { z: 150000, scale: 8 },
		slide16: { y: 5000, z: 150000, scale: 8 }
	}
});