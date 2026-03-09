const generarToken = () => Date.now().toString(32) + Math.random().toString(32).slice(2)
+ "^ovl-26";

export { generarToken }