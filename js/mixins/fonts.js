// Generated by CoffeeScript 1.8.0
(function() {
  var PDFFont;

  PDFFont = require('../font');

  module.exports = {
    initFonts: function() {
      this._fontFamilies = {};
      this._fontCount = 0;
      this._fontSize = 12;
      this._font = null;
      this._registeredFonts = {};
      return this.font('Helvetica');
    },
    font: function(src, family, size) {
      var cacheKey, font, id, _ref;
      if (typeof family === 'number') {
        size = family;
        family = null;
      }
      if (typeof src === 'string' && this._registeredFonts[src]) {
        cacheKey = src;
        _ref = this._registeredFonts[src], src = _ref.src, family = _ref.family;
      } else {
        cacheKey = family || src;
        if (typeof cacheKey !== 'string') {
          cacheKey = null;
        }
      }
      if (size != null) {
        this.fontSize(size);
      }
      if (font = this._fontFamilies[cacheKey]) {
        this._font = font;
        return this;
      }
      id = 'F' + (++this._fontCount);
      this._font = new PDFFont(this, src, family, id);
      if (font = this._fontFamilies[this._font.name]) {
        this._font = font;
        return this;
      }
      if (cacheKey) {
        this._fontFamilies[cacheKey] = this._font;
      }
      this._fontFamilies[this._font.name] = this._font;
      return this;
    },
    fontSize: function(_fontSize) {
      this._fontSize = _fontSize;
      return this;
    },
    currentLineHeight: function(includeGap) {
      if (includeGap == null) {
        includeGap = false;
      }
      return this._font.lineHeight(this._fontSize, includeGap);
    },
    registerFont: function(name, src, family) {
      this._registeredFonts[name] = {
        src: src,
        family: family
      };
      return this;
    }
  };

}).call(this);