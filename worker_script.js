(function() {
    function a(a) {
        var b, c, d, e = '',
            f = -1;
        if (a && a['length'])
            for (d = a['length'];
                (f += 1) < d;) b = a['charCodeAt'](f), c = f + 1 < d ? a['charCodeAt'](f + 1) : 0, 55296 <= b && 56319 >= b && 56320 <= c && 57343 >= c && (b = 65536 + ((1023 & b) << 10) + (1023 & c), f += 1), 127 >= b ? e += String['fromCharCode'](b) : 2047 >= b ? e += String['fromCharCode'](192 | 31 & b >>> 6, 128 | 63 & b) : 65535 >= b ? e += String['fromCharCode'](224 | 15 & b >>> 12, 128 | 63 & b >>> 6, 128 | 63 & b) : 2097151 >= b && (e += String['fromCharCode'](240 | 7 & b >>> 18, 128 | 63 & b >>> 12, 128 | 63 & b >>> 6, 128 | 63 & b));
        return e
    }

    function b(a, b) {
        var c = (65535 & a) + (65535 & b);
        return (a >> 16) + (b >> 16) + (c >> 16) << 16 | 65535 & c
    }

    function c(a, b) {
        for (var c, d = b ? '0123456789ABCDEF' : '0123456789abcdef', e = '', f = 0, g = a['length']; f < g; f += 1) c = a['charCodeAt'](f), e += d['charAt'](15 & c >>> 4) + d['charAt'](15 & c);
        return e
    }

    function d(a) {
        var b, c = 32 * a['length'],
            d = '';
        for (b = 0; b < c; b += 8) d += String['fromCharCode'](255 & a[b >> 5] >>> 24 - b % 32);
        return d
    }

    function e(a) {
        var b, c = 8 * a['length'],
            d = Array(a['length'] >> 2),
            e = d['length'];
        for (b = 0; b < e; b += 1) d[b] = 0;
        for (b = 0; b < c; b += 8) d[b >> 5] |= (255 & a['charCodeAt'](b / 8)) << 24 - b % 32;
        return d
    }

    function f(a, b) {
        return a >>> b | a << 32 - b
    }

    function g(a, b) {
        return a >>> b
    }

    function h(a, b, c) {
        return a & b ^ ~a & c
    }

    function i(a, b, c) {
        return a & b ^ a & c ^ b & c
    }

    function j(a) {
        return f(a, 2) ^ f(a, 13) ^ f(a, 22)
    }

    function k(a) {
        return f(a, 6) ^ f(a, 11) ^ f(a, 25)
    }

    function l(a) {
        return f(a, 7) ^ f(a, 18) ^ g(a, 3)
    }

    function m(a) {
        return f(a, 17) ^ f(a, 19) ^ g(a, 10)
    }

    function n(a, c) {
        var d, e, f, g, n, o, p, r, s, t, u, v, w = [1779033703, -1150833019, 1013904242, -1521486534, 1359893119, -1694144372, 528734635, 1541459225],
            x = [64];
        for (a[c >> 5] |= 128 << 24 - c % 32, a[(c + 64 >> 9 << 4) + 15] = c, s = 0; s < a['length']; s += 16) {
            for (d = w[0], e = w[1], f = w[2], g = w[3], n = w[4], o = w[5], p = w[6], r = w[7], t = 0; 64 > t; t += 1) x[t] = 16 > t ? a[t + s] : b(b(b(m(x[t - 2]), x[t - 7]), l(x[t - 15])), x[t - 16]), u = b(b(b(b(r, k(n)), h(n, o, p)), q[t]), x[t]), v = b(j(d), i(d, e, f)), r = p, p = o, o = n, n = b(g, u), g = f, f = e, e = d, d = b(u, v);
            w[0] = b(d, w[0]), w[1] = b(e, w[1]), w[2] = b(f, w[2]), w[3] = b(g, w[3]), w[4] = b(n, w[4]), w[5] = b(o, w[5]), w[6] = b(p, w[6]), w[7] = b(r, w[7])
        }
        return w
    }

    function o(b, c) {
        return b = c ? a(b) : b, d(n(e(b), 8 * b['length']))
    }

    function p(a) {
        const b = c(o(a, q));
        return b
    }
    var q = [1116352408, 1899447441, -1245643825, -373957723, 961987163, 1508970993, -1841331548, -1424204075, -670586216, 310598401, 607225278, 1426881987, 1925078388, -2132889090, -1680079193, -1046744716, -459576895, -272742522, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, -1740746414, -1473132947, -1341970488, -1084653625, -958395405, -710438585, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, -2117940946, -1838011259, -1564481375, -1474664885, -1035236496, -949202525, -778901479, -694614492, -200395387, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, -2067236844, -1933114872, -1866530822, -1538233109, -1090935817, -965641998];
    self['onmessage'] = function(a) {
        const b = a['data'];
        for (var c = 0;;) {
            var d = p(b + '' + c.toString());
            if (d['startsWith']('0020')) break;
            c++
        }
        self['postMessage'](c)
    }
})();