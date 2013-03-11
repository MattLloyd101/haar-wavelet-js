#### Utility functions ####

define ->

  # Generates a new unique ID value.
  #
  # The generated ID is definitely not guaranteed to be globally unqiue, this is 
  # little more than an auto-incrementing ID, but as long as this function is 
  # used for ID generation throughout an entire system it should suffice.
  genID: do ->
    id = 0
    () -> id++
    

  # Creates a function that generates pseudorandom numbers based on a seed.
  #
  # The range of returned numbers is 0 ≤ n < 1, so can be used as a drop in 
  # replacement for calls to Math.random.
  createRNG: (seed) ->
    seed = ~~seed
    () -> (seed = (seed * 16807) % 2147483647) / 2147483647
    

  # Creates a random initial RNG seed (using Math.random).
  #
  # This can be useful in situations where at first you want the RNG to behave 
  # differently each time, but with the option to later return to a seed that 
  # produced a particular result.
  createRNGSeed: () ->
    ~~(Math.random() * 2147483647)
    

  # Clamps a numeric value to the specified range. A slightly faster and easier 
  # to read alternative to Math.max(Math.min(n, max), min).
  clamp: (n, min, max) ->
    if n < min then min 
    else if n > max then max 
    else n
    

  # Loads a list of images in order and then executes a callback function, 
  # passing the list of loaded image objects to the callback, in the same order
  # they were loaded in.
  loadImages: (srcs, callback) ->
    result = []
    loadNextImage = () ->
      if srcs.length == result.length
        callback result
      else
        img = new Image()
        img.src = srcs[result.length]
        img.onload = () ->
          result.push img
          loadNextImage()
      null
    loadNextImage()