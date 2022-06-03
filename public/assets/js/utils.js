const random = (min, max) => parseInt(Math.random() * (max - min) + min)
const generateRandomRgba = () => `rgba(${random(1, 255)}, ${random(1, 255)}, ${random(1, 255)}, 0.2)` 