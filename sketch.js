let video
let faceapi
let startA = 59
let endA = 110
let startB = 140
let endB = 149
let didPlay = false
let anim
let fail
let loading
let lottie;
let isLoading = true
let prevLoc
let prevSize

let x = 0;

let score = 0
let duration = 180
let time = 0
let isLeft = false

const scaleLottie = 4.5
let failedData
let loadingData
let animData
let soundA

function preload() {
  animData = loadJSON('faceid.json')
  loadingData = loadJSON('loading.json')
  failedData = loadJSON('failed.json')
}

function setup() {
  createCanvas(600, 600);
   video = createCapture(VIDEO);
   video.hide();
  
  const detectionOptions = {
    withLandmarks: true,
    withDescriptors: false,
  }
  
  faceapi = ml5.faceApi(detectionOptions, modelLoaded)
  
   lottie = createDiv();
   let params = {
     container: lottie.elt,
     loop: true,
     autoplay: true,
     animationData: animData,
     renderer: 'svg',
   };
   
   lottie.position(-width/2, -height/2);
  anim = bodymovin.loadAnimation(params);
  
  failedLottie = createDiv();
  let failedParams = {
    container: failedLottie.elt,
    loop: true,
    autoplay: true,
    animationData: failedData,
    renderer: 'svg',
  };
    
  fail = bodymovin.loadAnimation(failedParams);
  failedLottie.size(min(width,height)/5, min(width,height)/5)
  failedLottie.position(-width/2, -height/2);
  
  loadingLottie = createDiv();
  let loadingParams = {
    container: loadingLottie.elt,
    loop: true,
    autoplay: true,
    animationData: loadingData,
    renderer: 'svg',
  };
    
  loading = bodymovin.loadAnimation(loadingParams);
  loadingLottie.size(min(width,height)/5, min(width,height)/5)
  loadingLottie.position(width/2 - min(width,height)/10, height/2 - min(width,height)/10);
  
  
}

function modelLoaded() {
  console.log('faceAPI ready')
}


function draw() {
background(255);
   textAlign(CENTER)
    if (!isLoading) {
        loadingLottie.position(-width/2, -height/2)
      text("Point your head to the camera",  width/2, height/2 + height/10)
    } else {
      text("Loading machine learning model...", width/2, height/2 + height/10)
    }
  
  image(video, 0, 0);
  
  let facePos

  faceapi.detect(video, (err, results) => {
    if (results.length == 0) { 
      failedLottie.position(prevLoc[0], prevLoc[1]);
      failedLottie.size(prevSize,prevSize)
      lottie.position(-width/2, -height/2)
      return
    }
      
     failedLottie.position(-width/2, -height/2)
     isLoading = false
    
     let eyeR = results[0].parts.rightEye;
     let eyeL = results[0].parts.leftEye;
     let d = dist(eyeR[0].x, eyeR[0].y, eyeL[eyeL.length-1].x, eyeL[eyeL.length-1].y);
    
    const size = d*scaleLottie
    prevSize = size
     lottie.size(size,size)
     const midX = (eyeR[0].x + eyeL[eyeL.length-1].x)/2 -(size/2)
     const midY = (eyeR[0].y + eyeL[eyeL.length-1].y)/2 -(size/2)+ 10
     
     facePos = {
        x: (eyeR[0].x + eyeL[eyeL.length-1].x)/2,
        y: (eyeR[0].y + eyeL[eyeL.length-1].y)/2,
        size: size
     }
      
     prevLoc = [midX, midY]
     lottie.position(prevLoc[0], prevLoc[1]);
      
      if (time > duration) {
    isLeft = Math.random() >= 0.5
    time = 0
  }
   
      const csize = min(width, height)/10
  const circlePos = {
    x: isLeft ? csize : width - csize,
    y: height/2,
    size: min(width, height)/10
  }
    
  drawCircle(circlePos)
    
  if (isIntersect(circlePos, facePos)) {
    score += 1
    isLeft = Math.random() >= 0.5
    time = 0
  }
      
      text("score", width/2, height - height/10)
    text(score, width/2, height - height/15)
  })
  
  
  
  time += 1
  
    
}

function animate(obj) {
  let targetFrames = [0, 0];
  if (!didPlay) {
    didPlay = true;
    targetFrames = [startA, endA];
  } else {
    didPlay = false;
    targetFrames = [startB, endB]
  }
  anim.playSegments([targetFrames], true);
}
  
  
function drawCircle(obj) {
  push()
  strokeWeight(4)
  textAlign(CENTER)
  fill(0,0,0,0)
  circle(obj.x, obj.y, obj.size)
  fill(0)
  textStyle(BOLD)
  textFont('Helvetica')
  text("+1", obj.x, obj.y+obj.size/10)
  pop()
}
  
function isIntersect(o1, o2) {
    let distSq = (o1.x - o2.x) * (o1.x - o2.x) + 
                 (o1.y - o2.y) * (o1.y - o2.y); 
    let radSumSq = (o1.size/2 + o2.size/2) * 
        (o1.size/2 + o2.size/2); 
    let res = distSq > radSumSq
    return !res 
  }