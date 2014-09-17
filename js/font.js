// Generated by CoffeeScript 1.8.0

/*
PDFFont - embeds fonts in PDF documents
By Devon Govett
 */

(function() {
  var AFMFont, PDFFont, Subset, TTFFont, fs;

  TTFFont = require('./font/ttf');

  AFMFont = require('./font/afm');

  Subset = require('./font/subset');

  fs = require('fs');

  PDFFont = (function() {
    var STANDARD_FONTS, toUnicodeCmap;

    function PDFFont(document, src, family, id) {
      this.document = document;
      this.id = id;
      if (typeof src === 'string') {
        if (src in STANDARD_FONTS) {
          this.isAFM = true;
          this.font = new AFMFont(STANDARD_FONTS[src]());
          this.registerAFM(src);
          return;
        } else if (/\.(ttf|ttc)$/i.test(src)) {
          this.font = TTFFont.open(src, family);
        } else if (/\.dfont$/i.test(src)) {
          this.font = TTFFont.fromDFont(src, family);
        } else {
          throw new Error('Not a supported font format or standard PDF font.');
        }
      } else if (Buffer.isBuffer(src)) {
        this.font = TTFFont.fromBuffer(src, family);
      } else if (src instanceof Uint8Array) {
        this.font = TTFFont.fromBuffer(new Buffer(src), family);
      } else if (src instanceof ArrayBuffer) {
        this.font = TTFFont.fromBuffer(new Buffer(new Uint8Array(src)), family);
      } else {
        throw new Error('Not a supported font format or standard PDF font.');
      }
      this.subset = new Subset(this.font);
      this.registerTTF();
    }

    STANDARD_FONTS = {
      "Courier": function() {
        return fs.readFileSync(__dirname + "/font/data/Courier.afm", 'utf8');
      },
      "Courier-Bold": function() {
        return fs.readFileSync(__dirname + "/font/data/Courier-Bold.afm", 'utf8');
      },
      "Courier-Oblique": function() {
        return fs.readFileSync(__dirname + "/font/data/Courier-Oblique.afm", 'utf8');
      },
      "Courier-BoldOblique": function() {
        return fs.readFileSync(__dirname + "/font/data/Courier-BoldOblique.afm", 'utf8');
      },
      "Helvetica": function() {
        return fs.readFileSync(__dirname + "/font/data/Helvetica.afm", 'utf8');
      },
      "Helvetica-Bold": function() {
        return fs.readFileSync(__dirname + "/font/data/Helvetica-Bold.afm", 'utf8');
      },
      "Helvetica-Oblique": function() {
        return fs.readFileSync(__dirname + "/font/data/Helvetica-Oblique.afm", 'utf8');
      },
      "Helvetica-BoldOblique": function() {
        return fs.readFileSync(__dirname + "/font/data/Helvetica-BoldOblique.afm", 'utf8');
      },
      "Times-Roman": function() {
        return fs.readFileSync(__dirname + "/font/data/Times-Roman.afm", 'utf8');
      },
      "Times-Bold": function() {
        return fs.readFileSync(__dirname + "/font/data/Times-Bold.afm", 'utf8');
      },
      "Times-Italic": function() {
        return fs.readFileSync(__dirname + "/font/data/Times-Italic.afm", 'utf8');
      },
      "Times-BoldItalic": function() {
        return fs.readFileSync(__dirname + "/font/data/Times-BoldItalic.afm", 'utf8');
      },
      "Symbol": function() {
        return fs.readFileSync(__dirname + "/font/data/Symbol.afm", 'utf8');
      },
      "ZapfDingbats": function() {
        return fs.readFileSync(__dirname + "/font/data/ZapfDingbats.afm", 'utf8');
      }
    };

    PDFFont.prototype.use = function(characters) {
      var _ref;
      return (_ref = this.subset) != null ? _ref.use(characters) : void 0;
    };

    PDFFont.prototype.embed = function() {
      if (this.embedded || (this.dictionary == null)) {
        return;
      }
      if (this.isAFM) {
        this.embedAFM();
      } else {
        this.embedTTF();
      }
      return this.embedded = true;
    };

    PDFFont.prototype.encode = function(text) {
      var _ref;
      if (this.isAFM) {
        return this.font.encodeText(text);
      } else {
        return ((_ref = this.subset) != null ? _ref.encodeText(text) : void 0) || text;
      }
    };

    PDFFont.prototype.ref = function() {
      return this.dictionary != null ? this.dictionary : this.dictionary = this.document.ref();
    };

    PDFFont.prototype.registerTTF = function() {
      var e, hi, low, raw, _ref;
      this.name = this.font.name.postscriptName;
      this.scaleFactor = 1000.0 / this.font.head.unitsPerEm;
      this.bbox = (function() {
        var _i, _len, _ref, _results;
        _ref = this.font.bbox;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          e = _ref[_i];
          _results.push(Math.round(e * this.scaleFactor));
        }
        return _results;
      }).call(this);
      this.stemV = 0;
      if (this.font.post.exists) {
        raw = this.font.post.italic_angle;
        hi = raw >> 16;
        low = raw & 0xFF;
        if (hi & 0x8000 !== 0) {
          hi = -((hi ^ 0xFFFF) + 1);
        }
        this.italicAngle = +("" + hi + "." + low);
      } else {
        this.italicAngle = 0;
      }
      this.ascender = Math.round(this.font.ascender * this.scaleFactor);
      this.decender = Math.round(this.font.decender * this.scaleFactor);
      this.lineGap = Math.round(this.font.lineGap * this.scaleFactor);
      this.capHeight = (this.font.os2.exists && this.font.os2.capHeight) || this.ascender;
      this.xHeight = (this.font.os2.exists && this.font.os2.xHeight) || 0;
      this.familyClass = (this.font.os2.exists && this.font.os2.familyClass || 0) >> 8;
      this.isSerif = (_ref = this.familyClass) === 1 || _ref === 2 || _ref === 3 || _ref === 4 || _ref === 5 || _ref === 7;
      this.isScript = this.familyClass === 10;
      this.flags = 0;
      if (this.font.post.isFixedPitch) {
        this.flags |= 1 << 0;
      }
      if (this.isSerif) {
        this.flags |= 1 << 1;
      }
      if (this.isScript) {
        this.flags |= 1 << 3;
      }
      if (this.italicAngle !== 0) {
        this.flags |= 1 << 6;
      }
      this.flags |= 1 << 5;
      if (!this.font.cmap.unicode) {
        throw new Error('No unicode cmap for font');
      }
    };

    PDFFont.prototype.embedTTF = function() {
      var charWidths, cmap, code, data, descriptor, firstChar, fontfile, glyph;
      data = this.subset.encode();
      fontfile = this.document.ref();
      fontfile.write(data);
      fontfile.data.Length1 = fontfile.uncompressedLength;
      fontfile.end();
      descriptor = this.document.ref({
        Type: 'FontDescriptor',
        FontName: this.subset.postscriptName,
        FontFile2: fontfile,
        FontBBox: this.bbox,
        Flags: this.flags,
        StemV: this.stemV,
        ItalicAngle: this.italicAngle,
        Ascent: this.ascender,
        Descent: this.decender,
        CapHeight: this.capHeight,
        XHeight: this.xHeight
      });
      descriptor.end();
      firstChar = +Object.keys(this.subset.cmap)[0];
      charWidths = (function() {
        var _ref, _results;
        _ref = this.subset.cmap;
        _results = [];
        for (code in _ref) {
          glyph = _ref[code];
          _results.push(Math.round(this.font.widthOfGlyph(glyph)));
        }
        return _results;
      }).call(this);
      cmap = this.document.ref();
      cmap.end(toUnicodeCmap(this.subset.subset));
      this.dictionary.data = {
        Type: 'Font',
        BaseFont: this.subset.postscriptName,
        Subtype: 'TrueType',
        FontDescriptor: descriptor,
        FirstChar: firstChar,
        LastChar: firstChar + charWidths.length - 1,
        Widths: charWidths,
        Encoding: 'MacRomanEncoding',
        ToUnicode: cmap
      };
      return this.dictionary.end();
    };

    toUnicodeCmap = function(map) {
      var code, codes, range, unicode, unicodeMap, _i, _len;
      unicodeMap = '/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n/CIDSystemInfo <<\n  /Registry (Adobe)\n  /Ordering (UCS)\n  /Supplement 0\n>> def\n/CMapName /Adobe-Identity-UCS def\n/CMapType 2 def\n1 begincodespacerange\n<00><ff>\nendcodespacerange';
      codes = Object.keys(map).sort(function(a, b) {
        return a - b;
      });
      range = [];
      for (_i = 0, _len = codes.length; _i < _len; _i++) {
        code = codes[_i];
        if (range.length >= 100) {
          unicodeMap += "\n" + range.length + " beginbfchar\n" + (range.join('\n')) + "\nendbfchar";
          range = [];
        }
        unicode = ('0000' + map[code].toString(16)).slice(-4);
        code = (+code).toString(16);
        range.push("<" + code + "><" + unicode + ">");
      }
      if (range.length) {
        unicodeMap += "\n" + range.length + " beginbfchar\n" + (range.join('\n')) + "\nendbfchar\n";
      }
      return unicodeMap += 'endcmap\nCMapName currentdict /CMap defineresource pop\nend\nend';
    };

    PDFFont.prototype.registerAFM = function(name) {
      var _ref;
      this.name = name;
      return _ref = this.font, this.ascender = _ref.ascender, this.decender = _ref.decender, this.bbox = _ref.bbox, this.lineGap = _ref.lineGap, _ref;
    };

    PDFFont.prototype.embedAFM = function() {
      this.dictionary.data = {
        Type: 'Font',
        BaseFont: this.name,
        Subtype: 'Type1',
        Encoding: 'WinAnsiEncoding'
      };
      return this.dictionary.end();
    };

    PDFFont.prototype.widthOfString = function(string, size) {
      var charCode, i, scale, width, _i, _ref;
      string = '' + string;
      width = 0;
      for (i = _i = 0, _ref = string.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        charCode = string.charCodeAt(i);
        width += this.font.widthOfGlyph(this.font.characterToGlyph(charCode)) || 0;
      }
      scale = size / 1000;
      return width * scale;
    };

    PDFFont.prototype.lineHeight = function(size, includeGap) {
      var gap;
      if (includeGap == null) {
        includeGap = false;
      }
      gap = includeGap ? this.lineGap : 0;
      return (this.ascender + gap - this.decender) / 1000 * size;
    };

    return PDFFont;

  })();

  module.exports = PDFFont;

}).call(this);
