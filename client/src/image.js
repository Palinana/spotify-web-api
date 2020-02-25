import FastAverageColor from 'fast-average-color';

export function getAverageRGB(imgEl) {
    const fac = new FastAverageColor();
    fac.getColorAsync(imgEl)
        console.log('imgEl ', imgEl)
        .then(function(color) {
            console.log('color ', color)
            // container.style.backgroundColor = color.rgba;
            // container.style.color = color.isDark ? '#fff' : '#000';
        })
        .catch(function(e) {
            console.log(e);
        });
}