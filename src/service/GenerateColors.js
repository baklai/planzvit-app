export const GenerateColors = count => {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const rgbaColor = `rgba(${r}, ${g}, ${b}, 0.3)`;
    const rgbColor = `rgb(${r}, ${g}, ${b})`;
    colors.push({ backgroundColor: rgbaColor, borderColor: rgbColor });
  }
  return colors;
};
