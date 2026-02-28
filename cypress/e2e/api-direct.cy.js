describe('Direct API - getColor()', { testIsolation: false }, function() {
    before(function() {
        cy.visit('http://localhost:8080/cypress/test-pages/api-direct.html');
        cy.get('body[data-ready="true"]', { timeout: 10000 });
    });

    it('returns near-black for black.png', function() {
        cy.window().then((win) => {
            const ct = new win.ColorThief();
            const img = win.document.getElementById('img-black');
            const color = ct.getColor(img);
            expect(color).to.have.lengthOf(3);
            expect(color[0]).to.be.lessThan(10);
            expect(color[1]).to.be.lessThan(10);
            expect(color[2]).to.be.lessThan(10);
        });
    });

    it('returns near-red for red.png', function() {
        cy.window().then((win) => {
            const ct = new win.ColorThief();
            const img = win.document.getElementById('img-red');
            const color = ct.getColor(img);
            expect(color).to.have.lengthOf(3);
            expect(color[0]).to.be.greaterThan(240);
            expect(color[1]).to.be.lessThan(15);
            expect(color[2]).to.be.lessThan(15);
        });
    });

    it('returns null for white.png', function() {
        cy.window().then((win) => {
            const ct = new win.ColorThief();
            const img = win.document.getElementById('img-white');
            const color = ct.getColor(img);
            expect(color).to.be.null;
        });
    });

    it('returns null for transparent.png', function() {
        cy.window().then((win) => {
            const ct = new win.ColorThief();
            const img = win.document.getElementById('img-transparent');
            const color = ct.getColor(img);
            expect(color).to.be.null;
        });
    });

    it('respects quality parameter', function() {
        cy.window().then((win) => {
            const ct = new win.ColorThief();
            const img = win.document.getElementById('img-rainbow');
            const color1 = ct.getColor(img, 1);
            const color100 = ct.getColor(img, 100);
            expect(color1).to.have.lengthOf(3);
            expect(color100).to.have.lengthOf(3);
        });
    });
});

describe('Direct API - getPalette()', { testIsolation: false }, function() {
    before(function() {
        cy.visit('http://localhost:8080/cypress/test-pages/api-direct.html');
        cy.get('body[data-ready="true"]', { timeout: 10000 });
    });

    it('returns default 10 colors', function() {
        cy.window().then((win) => {
            const ct = new win.ColorThief();
            const img = win.document.getElementById('img-rainbow');
            const palette = ct.getPalette(img);
            expect(palette).to.have.lengthOf(10);
            palette.forEach(color => {
                expect(color).to.have.lengthOf(3);
            });
        });
    });

    it('returns null for white.png', function() {
        cy.window().then((win) => {
            const ct = new win.ColorThief();
            const img = win.document.getElementById('img-white');
            const palette = ct.getPalette(img);
            expect(palette).to.be.null;
        });
    });

    it('returns null for transparent.png', function() {
        cy.window().then((win) => {
            const ct = new win.ColorThief();
            const img = win.document.getElementById('img-transparent');
            const palette = ct.getPalette(img);
            expect(palette).to.be.null;
        });
    });

    it('throws when colorCount=1', function() {
        cy.window().then((win) => {
            const ct = new win.ColorThief();
            const img = win.document.getElementById('img-rainbow');
            expect(() => ct.getPalette(img, 1)).to.throw();
        });
    });

    it('clamps colorCount=0 to 2', function() {
        cy.window().then((win) => {
            const ct = new win.ColorThief();
            const img = win.document.getElementById('img-rainbow');
            const palette = ct.getPalette(img, 0);
            expect(palette).to.have.lengthOf(2);
        });
    });

    it('clamps colorCount=21 to 20', function() {
        cy.window().then((win) => {
            const ct = new win.ColorThief();
            const img = win.document.getElementById('img-rainbow');
            const palette = ct.getPalette(img, 21);
            expect(palette).to.have.lengthOf(20);
        });
    });
});
