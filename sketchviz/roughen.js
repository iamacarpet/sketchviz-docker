const fs = require("fs");
const util = require("util");

const writeFile = util.promisify(fs.writeFile);

const rough = require("roughjs");

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);

var coarse = (function () {
    function getAttributes(element) {
        return Array.prototype.slice.call(element.attributes);
    }

    function getNum(element, attributes) {
        return attributes.map(function (attr) { return parseFloat(element.getAttribute(attr), 10) });
    }

    function getDiam(element, attributes) {
        return attributes.map(function (attr) { return 2 * parseFloat(element.getAttribute(attr), 10) });
    }

    function getCoords(element, attribute) {
        return element
            .getAttribute(attribute)
            .trim()
            .split(' ')
            .filter(function (item) { return item.length > 0 })
            .map(function (item) { return item.trim().split(',').map(function (num) { return parseFloat(num, 10); }) });
    }

    function getSettings(element) {
        var settings = {};

        if (element.hasAttribute('stroke')) {
            settings.stroke = element.getAttribute('stroke');
        }

        if (element.hasAttribute('fill')) {
            settings.fill = element.getAttribute('fill');
        }

        if (element.hasAttribute('stroke-width') && !element.getAttribute('stroke-width').includes('%')) {
            settings.strokeWidth = parseFloat(element.getAttribute('stroke-width', 10));
        }

        return settings;
    }

    return function coarse(svg, options) {
        var blacklist = [
            'cx',
            'cy',
            'd',
            'fill',
            'height',
            'points',
            'r',
            'rx',
            'ry',
            'stroke-width',
            'stroke',
            'width',
            'x',
            'x1',
            'x2',
            'y',
            'y1',
            'y2'
        ];

        function flatten() {
            var rv = [];
            for (var i = 0; i < arguments.length; i++) {
                var arr = arguments[i];
                for (var j = 0; j < arr.length; j++) {
                    rv.push(arr[j]);
                }
            }
            return rv;
        }

        var rc = rough.svg(svg, options || {});

        var children = svg.querySelectorAll('circle, rect, ellipse, line, polygon, polyline, path');

        for (var i = 0; i < children.length; i += 1) {
            var original = children[i];
            var params = [];
            var shapeType;

            switch (original.tagName) {
                case 'circle':
                    params = flatten(getNum(original, ['cx', 'cy']), getDiam(original, ['r']));
                    shapeType = 'circle';
                    break;
                case 'rect':
                    params = flatten(getNum(original, ['x', 'y', 'width', 'height']));
                    shapeType = 'rectangle';
                    break;
                case 'ellipse':
                    params = flatten(getNum(original, ['cx', 'cy']), getDiam(original, ['rx', 'ry']));
                    shapeType = 'ellipse';
                    break;
                case 'line':
                    params = flatten(getNum(original, ['x1', 'y1', 'x2', 'y2']));
                    shapeType = 'line';
                    break;
                case 'polygon':
                    params = [getCoords(original, 'points')];
                    shapeType = 'polygon';
                    break;
                case 'polyline':
                    params = [getCoords(original, 'points')];
                    shapeType = 'linearPath';
                    break;
                case 'path':
                    params = [original.getAttribute('d')];
                    shapeType = 'path';
                    break;
            }

            var replacement = rc[shapeType](...params, getSettings(original));

            var attributes = getAttributes(original).filter(function (attribute) {
                return !blacklist.includes(attribute.name)
            });

            for (var j = 0; j < attributes.length; j++) {
                replacement.setAttribute(attributes[j].name, attributes[j].value);
            }

            original.replaceWith(replacement);
        }
    }
})();

function sketchy(result) {
    var parsed = new window.DOMParser().parseFromString(result, 'text/xml').querySelector('svg');
    var coarsified = coarse(parsed);
    return parsed.outerHTML;
}

var myArgs = process.argv.slice(2);

fs.readFile(myArgs[0], {}, function(err, data){
    fs.writeFile(myArgs[1], sketchy(data.toString()), function(){});
});