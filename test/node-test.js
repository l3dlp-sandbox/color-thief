const { resolve } = require('path');
const { readFileSync } = require('fs');
const ColorThief = require(resolve(process.cwd(), "dist/color-thief.js"));
const chai = require("chai");
const expect = chai.expect;
chai.use(require("chai-as-promised"));

const imgDir = resolve(process.cwd(), 'cypress/test-pages/img');
const imgPath = (name) => resolve(imgDir, name);

function isValidRGB(color) {
    return Array.isArray(color)
        && color.length === 3
        && color.every(v => Number.isInteger(v) && v >= 0 && v <= 255);
}

function isCloseTo(actual, expected, tolerance = 15) {
    return actual.every((v, i) => Math.abs(v - expected[i]) <= tolerance);
}


describe('getColor()', function() {
    it('returns valid RGB from file path', function() {
        return ColorThief.getColor(imgPath('rainbow-vertical.png')).then(color => {
            expect(isValidRGB(color)).to.be.true;
        });
    });

    it('returns valid RGB from Buffer', function() {
        const buffer = readFileSync(imgPath('rainbow-vertical.png'));
        return ColorThief.getColor(buffer).then(color => {
            expect(isValidRGB(color)).to.be.true;
        });
    });

    it('returns near-black for black.png', function() {
        return ColorThief.getColor(imgPath('black.png')).then(color => {
            expect(isValidRGB(color)).to.be.true;
            expect(isCloseTo(color, [0, 0, 0])).to.be.true;
        });
    });

    it('returns near-red for red.png', function() {
        return ColorThief.getColor(imgPath('red.png')).then(color => {
            expect(isValidRGB(color)).to.be.true;
            expect(isCloseTo(color, [255, 0, 0])).to.be.true;
        });
    });

    it('returns null for white.png', function() {
        return ColorThief.getColor(imgPath('white.png')).then(color => {
            expect(color).to.be.null;
        });
    });

    it('returns null for transparent.png', function() {
        return ColorThief.getColor(imgPath('transparent.png')).then(color => {
            expect(color).to.be.null;
        });
    });

    it('respects quality parameter (quality=1)', function() {
        return ColorThief.getColor(imgPath('rainbow-vertical.png'), 1).then(color => {
            expect(isValidRGB(color)).to.be.true;
        });
    });

    it('respects quality parameter (quality=100)', function() {
        return ColorThief.getColor(imgPath('rainbow-vertical.png'), 100).then(color => {
            expect(isValidRGB(color)).to.be.true;
        });
    });

    it('rejects for non-existent file path', function() {
        return expect(ColorThief.getColor('/non/existent/file.png')).to.be.rejected;
    });
});


describe('getPalette()', function() {
    it('returns 10 colors with default colorCount', function() {
        return ColorThief.getPalette(imgPath('rainbow-vertical.png')).then(palette => {
            expect(palette).to.have.lengthOf(10);
            palette.forEach(color => expect(isValidRGB(color)).to.be.true);
        });
    });

    it('returns 2 colors (boundary min)', function() {
        return ColorThief.getPalette(imgPath('rainbow-vertical.png'), 2).then(palette => {
            expect(palette).to.have.lengthOf(2);
        });
    });

    it('returns 20 colors (boundary max)', function() {
        return ColorThief.getPalette(imgPath('rainbow-vertical.png'), 20).then(palette => {
            expect(palette).to.have.lengthOf(20);
        });
    });

    it('clamps colorCount=0 to 2', function() {
        return ColorThief.getPalette(imgPath('rainbow-vertical.png'), 0).then(palette => {
            expect(palette).to.have.lengthOf(2);
        });
    });

    it('clamps colorCount=-1 to 2', function() {
        return ColorThief.getPalette(imgPath('rainbow-vertical.png'), -1).then(palette => {
            expect(palette).to.have.lengthOf(2);
        });
    });

    it('clamps colorCount=21 to 20', function() {
        return ColorThief.getPalette(imgPath('rainbow-vertical.png'), 21).then(palette => {
            expect(palette).to.have.lengthOf(20);
        });
    });

    it('throws when colorCount=1', function() {
        expect(() => ColorThief.getPalette(imgPath('rainbow-vertical.png'), 1)).to.throw();
    });

    it('defaults non-integer colorCount (5.5) to 10', function() {
        return ColorThief.getPalette(imgPath('rainbow-vertical.png'), 5.5).then(palette => {
            expect(palette).to.have.lengthOf(10);
        });
    });

    it('returns null for white.png', function() {
        return ColorThief.getPalette(imgPath('white.png')).then(palette => {
            expect(palette).to.be.null;
        });
    });

    it('returns null for transparent.png', function() {
        return ColorThief.getPalette(imgPath('transparent.png')).then(palette => {
            expect(palette).to.be.null;
        });
    });

    it('works with Buffer input', function() {
        const buffer = readFileSync(imgPath('rainbow-vertical.png'));
        return ColorThief.getPalette(buffer, 5).then(palette => {
            expect(palette).to.have.lengthOf(5);
            palette.forEach(color => expect(isValidRGB(color)).to.be.true);
        });
    });

    it('rejects for non-existent file', function() {
        return expect(ColorThief.getPalette('/non/existent/file.png')).to.be.rejected;
    });
});
