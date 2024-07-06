
const patternTypes = {
  dots: 'Dots',
  lines: 'Lines',
  crosses: 'Crosses',
  circles: 'Circles',
  triangles: 'Triangles',
  squares: 'Squares',
};

const sizeGradientTypes = {
  none: 'None',
  linear: 'Linear Increase',
  radial: 'Radial',
  diagonalWaves: 'Diagonal Waves',
  checkerboard: 'Checkerboard',
  angular: 'Angular',
  spiral: 'Spiral',
  diamond: 'Diamond',
  centerGradient: 'Center Gradient'
};

const animationPatterns = {
  linear: 'Linear',
  circular: 'Circular',
  bounce: 'Bounce',
  random: 'Random',
};

const getRandomColor = (baseColor: string) => {
	const r = parseInt(baseColor.slice(1, 3), 16);
	const g = parseInt(baseColor.slice(3, 5), 16);
	const b = parseInt(baseColor.slice(5, 7), 16);
	return `rgb(${r + Math.floor(Math.random() * 64 - 32)}, ${g + Math.floor(Math.random() * 64 - 32)}, ${b + Math.floor(Math.random() * 64 - 32)})`;
};

const updateCanvasSize = (canvas: HTMLCanvasElement) => {
	const container = canvas.parentElement;
	if (container) {
		canvas.width = container.clientWidth;
		canvas.height = container.clientHeight;
	}
};


const setPageBackground = (dataUrl: string) => {
document.body.style.backgroundImage = `url(${dataUrl})`;
document.body.style.backgroundRepeat = 'none';
document.body.style.backgroundSize = 'auto';
};

const resetPageBackground = () => {
document.body.style.backgroundImage = 'none';
document.body.style.backgroundColor = '';
};



export { patternTypes, sizeGradientTypes, animationPatterns, getRandomColor, updateCanvasSize, setPageBackground, resetPageBackground };