// Generated by CoffeeScript 1.3.3
(function() {

  define(["util"], function(util) {
    var doHaar, findCoefs, haarApply, haarTransform, haarUnapply, showImg, showOrder, showOrderTo, transformCol, transformRow, unHaarTransform, unTransformCol, unTransformRow, undoHaar, writeCol, writeData, writeRow;
    doHaar = function(image, offset, stride, size) {
      var avg, c2, channel, diff, i, idx, masterAvg, masterDiff, _i, _j;
      masterAvg = [];
      masterDiff = [];
      for (channel = _i = 0; _i <= 2; channel = ++_i) {
        avg = masterAvg[channel] = [];
        diff = masterDiff[channel] = [];
        c2 = Math.floor(size / 2);
        for (i = _j = 0; 0 <= c2 ? _j < c2 : _j > c2; i = 0 <= c2 ? ++_j : --_j) {
          idx = offset + (2 * i) * stride + channel;
          avg[i] = (image[idx] + image[idx + stride]) / 2;
          diff[i] = image[idx] - avg[i];
        }
      }
      return [masterAvg, masterDiff];
    };
    undoHaar = function(imgData, offset, stride, size, diffOff, scale) {
      var c2, channel, i, idx, image, tmp, _i, _j, _results;
      tmp = [];
      c2 = Math.floor(size / 2);
      image = imgData.data;
      _results = [];
      for (channel = _i = 0; _i <= 2; channel = ++_i) {
        for (i = _j = 0; 0 <= c2 ? _j < c2 : _j > c2; i = 0 <= c2 ? ++_j : --_j) {
          idx = offset + (i * stride) + channel;
          tmp[2 * i] = image[idx] + (((image[idx + (c2 * stride)] / 255) * scale) - diffOff);
          tmp[2 * i + 1] = image[idx] - (((image[idx + (c2 * stride)] / 255) * scale) - diffOff);
        }
        _results.push((function() {
          var _k, _results1;
          _results1 = [];
          for (i = _k = 0; 0 <= size ? _k < size : _k > size; i = 0 <= size ? ++_k : --_k) {
            idx = offset + (i * stride) + channel;
            _results1.push(image[idx] = tmp[i]);
          }
          return _results1;
        })());
      }
      return _results;
    };
    transformRow = function(image, row, rowWidth, colHeight, pixelWidth) {
      return doHaar(image, row * rowWidth * pixelWidth, pixelWidth, colHeight);
    };
    transformCol = function(image, col, rowWidth, colHeight, pixelWidth) {
      return doHaar(image, col * pixelWidth, rowWidth * pixelWidth, rowWidth);
    };
    unTransformRow = function(image, row, rowWidth, colHeight, pixelWidth, coefs) {
      return undoHaar(image, row * rowWidth * pixelWidth, pixelWidth, rowWidth, coefs[0], coefs[1]);
    };
    unTransformCol = function(image, col, rowWidth, colHeight, pixelWidth, coefs) {
      return undoHaar(image, col * pixelWidth, rowWidth * pixelWidth, colHeight, coefs[0], coefs[1]);
    };
    findCoefs = function(dimension) {
      var channel, diff, i, item, negCoef, posCoef, _i, _j, _k, _len, _len1;
      negCoef = posCoef = 0;
      for (_i = 0, _len = dimension.length; _i < _len; _i++) {
        item = dimension[_i];
        for (channel = _j = 0; _j <= 2; channel = ++_j) {
          diff = item[1][channel];
          for (_k = 0, _len1 = diff.length; _k < _len1; _k++) {
            i = diff[_k];
            if (i > posCoef) {
              posCoef = i;
            }
            if (i < negCoef) {
              negCoef = i;
            }
          }
        }
      }
      return [-negCoef, posCoef - negCoef];
    };
    writeData = function(image, data, coefs, offset, stride, size) {
      var avg, c2, channel, diff, diffOff, i, idx, masterAvg, masterDiff, scale, _i, _results;
      masterAvg = data[0];
      masterDiff = data[1];
      diffOff = coefs[0];
      scale = coefs[1];
      c2 = Math.floor(size / 2);
      _results = [];
      for (channel = _i = 0; _i <= 2; channel = ++_i) {
        avg = masterAvg[channel];
        diff = masterDiff[channel];
        _results.push((function() {
          var _j, _results1;
          _results1 = [];
          for (i = _j = 0; 0 <= c2 ? _j < c2 : _j > c2; i = 0 <= c2 ? ++_j : --_j) {
            idx = offset + i * stride + channel;
            image[idx] = avg[i];
            _results1.push(image[idx + (c2 * stride)] = ((diffOff + diff[i]) / scale) * 255);
          }
          return _results1;
        })());
      }
      return _results;
    };
    writeRow = function(image, data, coefs, row, rowWidth, colHeight, pixelWidth) {
      return writeData(image, data, coefs, row * rowWidth * pixelWidth, pixelWidth, rowWidth);
    };
    writeCol = function(image, data, coefs, col, rowWidth, colHeight, pixelWidth) {
      return writeData(image, data, coefs, col * pixelWidth, rowWidth * pixelWidth, colHeight);
    };
    haarTransform = function(imgData, w, h) {
      var colCoefs, colData, i, image, rowCoefs, rowData, _i, _j, _k, _l, _ref, _ref1, _ref2, _ref3;
      image = imgData.data;
      rowData = [];
      colData = [];
      for (i = _i = 0, _ref = w - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        rowData.push(transformRow(image, i, w, h, 4));
      }
      rowCoefs = findCoefs(rowData);
      for (i = _j = 0, _ref1 = w - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        writeRow(image, rowData[i], rowCoefs, i, w, h, 4);
      }
      colCoefs = [];
      for (i = _k = 0, _ref2 = h - 1; 0 <= _ref2 ? _k <= _ref2 : _k >= _ref2; i = 0 <= _ref2 ? ++_k : --_k) {
        colData.push(transformCol(image, i, w, h, 4));
      }
      colCoefs = findCoefs(colData);
      for (i = _l = 0, _ref3 = h - 1; 0 <= _ref3 ? _l <= _ref3 : _l >= _ref3; i = 0 <= _ref3 ? ++_l : --_l) {
        writeCol(image, colData[i], colCoefs, i, w, h, 4);
      }
      return [imgData, rowCoefs, colCoefs];
    };
    unHaarTransform = function(image, w, h, rowCoefs, colCoefs) {
      var i, _i, _j, _ref, _ref1;
      for (i = _i = 0, _ref = h - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        unTransformCol(image, i, w, h, 4, colCoefs);
      }
      for (i = _j = 0, _ref1 = w - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        unTransformRow(image, i, w, h, 4, rowCoefs);
      }
      return image;
    };
    haarApply = function(ctx, w, h) {
      var colCoefs, imgData, newData, rowCoefs, _ref;
      imgData = ctx.getImageData(0, 0, w, h);
      _ref = haarTransform(imgData, w, h), newData = _ref[0], rowCoefs = _ref[1], colCoefs = _ref[2];
      return [rowCoefs, colCoefs, newData];
    };
    haarUnapply = function(ctx, w, h, rowCoefs, colCoefs) {
      var imgData, newData;
      imgData = ctx.getImageData(0, 0, w, h);
      newData = unHaarTransform(imgData, w, h, rowCoefs, colCoefs);
      return newData;
    };
    showOrderTo = function(origImg, origCtx, w, h, count) {
      var x, _i, _results;
      _results = [];
      for (x = _i = 1; 1 <= count ? _i < count : _i > count; x = 1 <= count ? ++_i : --_i) {
        _results.push(showOrder(origImg, origCtx, w, h, x));
      }
      return _results;
    };
    showImg = function(imgData, title, w, h) {
      var canvas, nctx;
      canvas = document.createElement("canvas");
      canvas.id = title;
      canvas.width = w;
      canvas.height = h;
      nctx = canvas.getContext("2d");
      $('body').append(canvas);
      nctx.putImageData(imgData, 0, 0);
      return nctx;
    };
    showOrder = function(origImg, origCtx, w, h, n) {
      var breaker, colCoefs, ctx, imgData, nctx, nimgData, rowCoefs, unwind, x, _i, _j, _ref, _ref1;
      showImg(origImg, "orig", w, h);
      ctx = origCtx;
      unwind = [];
      rowCoefs = null;
      colCoefs = null;
      imgData = null;
      for (x = _i = 0; 0 <= n ? _i < n : _i > n; x = 0 <= n ? ++_i : --_i) {
        _ref = haarApply(ctx, w, h), rowCoefs = _ref[0], colCoefs = _ref[1], nimgData = _ref[2];
        ctx = showImg(nimgData, "order" + x, w, h);
        imgData = nimgData;
        unwind.push([rowCoefs, colCoefs]);
      }
      for (x = _j = n; n <= 1 ? _j <= 1 : _j >= 1; x = n <= 1 ? ++_j : --_j) {
        _ref1 = unwind[x - 1], rowCoefs = _ref1[0], colCoefs = _ref1[1];
        nimgData = haarUnapply(ctx, w, h, rowCoefs, colCoefs);
        nctx = showImg(nimgData, "unwind" + x, w, h);
        ctx = nctx;
        imgData = nimgData;
      }
      showImg(origImg, "orig", w, h);
      breaker = document.createElement("br");
      return $('body').append(breaker);
    };
    return $(function() {
      var $body, img;
      $body = $('body');
      img = new Image();
      img.onload = function() {
        window.GO = function() {
          var canvas, h, octx, w;
          canvas = document.createElement("canvas");
          canvas.id = "orig";
          w = canvas.width = img.width;
          h = canvas.height = img.height;
          octx = canvas.getContext("2d");
          $body.append(canvas);
          octx.drawImage(img, 0, 0);
          return showOrder(octx.getImageData(0, 0, w, h), octx, w, h, 4);
        };
        return window.GO();
      };
      return img.src = 'images/lena-small.jpg';
    });
  });

}).call(this);
