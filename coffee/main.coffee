# Origonally created by Emil Mikulic
# http://dmr.ath.cx/
# Converted from http://dmr.ath.cx/gfx/haar/haar.c

define ["util"], (util) ->

  doHaar = (image, offset, stride, size) ->
    masterAvg = []
    masterDiff = []
    for channel in [0..2]
      avg = masterAvg[channel] = []
      diff = masterDiff[channel] = []
      
      c2 = Math.floor(size/2)
      for i in [0...c2]
        idx = offset + (2*i) * stride + channel
        avg[i] = (image[idx] + image[idx + stride]) / 2
        diff[i] = image[idx] - avg[i]
      
    [masterAvg, masterDiff]
    
  undoHaar = (imgData, offset, stride, size, diffOff, scale) ->
    tmp = []
    c2 = Math.floor(size / 2)
    image = imgData.data
    
    for channel in [0..2]
      for i in [0...c2]
        idx = offset + (i * stride) + channel
        tmp[2*i] = image[idx] + (((image[idx+(c2*stride)] / 255) * scale) - diffOff)
        tmp[2*i + 1] = image[idx] - (((image[idx+(c2*stride)] / 255) * scale) - diffOff)
        
      for i in [0...size]
        idx = offset + (i * stride) + channel
        image[idx] = tmp[i]

        
  transformRow = (image, row, rowWidth, colHeight, pixelWidth) -> 
    doHaar(image, row*rowWidth*pixelWidth, pixelWidth, colHeight)
    
  transformCol = (image, col, rowWidth, colHeight, pixelWidth) -> 
    doHaar(image, col*pixelWidth, rowWidth*pixelWidth, rowWidth)
    
  unTransformRow = (image, row, rowWidth, colHeight, pixelWidth, coefs) -> 
    undoHaar(image, row*rowWidth*pixelWidth, pixelWidth, rowWidth, coefs[0], coefs[1])
    
  unTransformCol = (image, col, rowWidth, colHeight, pixelWidth, coefs) -> 
    undoHaar(image, col*pixelWidth, rowWidth*pixelWidth, colHeight, coefs[0], coefs[1])
    
  findCoefs = (dimension) ->
    negCoef = posCoef = 0
    for item in dimension
      for channel in [0..2]
        diff = item[1][channel]
        for i in diff
          if(i > posCoef) then posCoef = i
          if(i < negCoef) then negCoef = i
    
    [-negCoef, posCoef - negCoef]
    
  writeData = (image, data, coefs, offset, stride, size) ->
    masterAvg = data[0]
    masterDiff = data[1]
    diffOff = coefs[0]
    scale = coefs[1]
    c2 = Math.floor(size / 2)
    # console.log c2
    
    for channel in [0..2]
      avg = masterAvg[channel]
      diff = masterDiff[channel]
      for i in [0...c2]
        idx = offset + i * stride + channel
        image[idx] = avg[i]
        image[idx+(c2*stride)] = ((diffOff + diff[i]) / scale) * 255
        
  writeRow = (image, data, coefs, row, rowWidth, colHeight, pixelWidth) ->
    writeData(image, data, coefs, row*rowWidth*pixelWidth, pixelWidth, rowWidth)
    
  writeCol = (image, data, coefs, col, rowWidth, colHeight, pixelWidth) ->
    writeData(image, data, coefs, col*pixelWidth, rowWidth*pixelWidth, colHeight)
  
  haarTransform = (imgData, w, h) -> 
    image = imgData.data
    rowData = []
    colData = []
    # console.log("Transforming Rows")
    for i in [0..w-1]
      rowData.push transformRow image, i, w, h, 4
      
    # This is really annoying. The write should be in doHaar.
    # However we need to find all the coefs first so we can scale correctly...
    # console.log("Finding Row Coefficients")
    rowCoefs = findCoefs(rowData)
    
    # console.log("Writing Rows")
    for i in [0..w-1]
      writeRow image, rowData[i], rowCoefs, i, w, h, 4
    
    colCoefs = []
    # console.log("Transforming Cols")
    for i in [0..h-1]
      colData.push transformCol image, i, w, h, 4

    # console.log("Finding Col Coefficients")
    colCoefs = findCoefs(colData)
    
    # console.log("Writing Cols")
    for i in [0..h-1]
      writeCol image, colData[i], colCoefs, i, w, h, 4    
    
    [imgData, rowCoefs, colCoefs]
    
  unHaarTransform = (image, w, h, rowCoefs, colCoefs) ->    
    for i in [0..h-1]
       unTransformCol image, i, w, h, 4, colCoefs
       
    for i in [0..w-1]
       unTransformRow image, i, w, h, 4, rowCoefs
      

    image

  haarApply = (ctx, w, h) ->
    imgData = ctx.getImageData(0, 0, w, h)
    
    [newData, rowCoefs, colCoefs] = haarTransform(imgData, w, h)
    

    [rowCoefs, colCoefs, newData]
    
  haarUnapply = (ctx, w, h, rowCoefs, colCoefs) ->
    imgData = ctx.getImageData(0, 0, w, h)
    
    newData = unHaarTransform(imgData, w, h, rowCoefs, colCoefs)

    newData
    
  showOrderTo = (origImg, origCtx, w, h, count) ->
    # console.log("WAT" + count)
    for x in [1...count]
      showOrder(origImg, origCtx, w, h, x)
    
  showImg = (imgData, title, w, h) ->
    canvas = document.createElement("canvas")
    canvas.id = title
    canvas.width = w
    canvas.height = h
    
    nctx = canvas.getContext("2d")
    
    # console.log("nctx> ", nctx, imgData)
    $('body').append(canvas)
    nctx.putImageData(imgData,0,0)
    nctx
    
  showOrder = (origImg, origCtx, w, h, n) ->
    showImg(origImg, "orig", w, h)
    ctx = origCtx
    unwind = []
    rowCoefs = null
    colCoefs = null
    imgData = null
    for x in [0...n]
      
      [rowCoefs, colCoefs, nimgData] = haarApply(ctx, w, h)
      # console.log(nimgData)
      ctx = showImg(nimgData, "order" + x, w, h)
      imgData = nimgData
      unwind.push([rowCoefs, colCoefs])
    
    for x in [n..1]
      # console.log(">>", x, n, unwind)
      [rowCoefs, colCoefs] = unwind[x-1]
      nimgData = haarUnapply(ctx, w, h, rowCoefs, colCoefs)
      nctx = showImg(nimgData, "unwind" + x, w, h)
      ctx = nctx
      imgData = nimgData
      
    showImg(origImg, "orig", w, h)
    breaker = document.createElement("br")
    $('body').append(breaker)

      
    
  $ -> 
    $body = $('body')
    
    img = new Image()
    img.onload = () ->
      window.GO = () ->
        canvas = document.createElement("canvas")
        canvas.id = "orig"
        w = canvas.width = img.width
        h = canvas.height = img.height
        
        octx = canvas.getContext("2d")
        
        $body.append(canvas)
        
        octx.drawImage(img, 0, 0)
        # showOrderTo(octx.getImageData(0, 0, w, h), octx, w, h, 8)
        showOrder(octx.getImageData(0, 0, w, h), octx, w, h, 4)
        
      window.GO()

    img.src = 'images/lena-small.jpg'
		
