//Pink and Slow

import processing.sound.*;

//Mapping
int cols, rows;
int scl = 30;
int w = 1600;
int h = 1600;

float flying = 0;

float[][] terrain;

float rate = 20;

//Audio
FFT fft;
AudioIn in;
int bands = 512;
float[] spectrum = new float[bands];

color adjustColorWithAmplitude(float amplitude) {
  color lowAmplitudeColor = color(0, 255, 255); // Cyan
  color highAmplitudeColor = color(255, 0, 255); // Magenta
  float amplitudeValue = map(amplitude*100, 0, 1, 0, 1);
  color interpolatedColor = lerpColor(lowAmplitudeColor, highAmplitudeColor, amplitudeValue);
  return color(interpolatedColor);
}

int prevTime = 0;
int colorDuration = 1000; // 1000 milliseconds = 1 second
color startColor, endColor;

void setup() {
  fullScreen(P3D);
  frameRate(rate); 

  cols = w / scl;
  rows = h / scl;
  terrain = new float[rows][cols];

  // Create an Input stream which is routed into the Amplitude analyzer
  fft = new FFT(this, bands);
  in = new AudioIn(this, 0);

  // start the Audio Input
  in.start();

  // patch the AudioIn
  fft.input(in);
}

void draw() {
  fft.analyze(spectrum);

  flying -= 0.03;

  float sensitivity = 2 + map(max(spectrum), 0, 1, 0, 100);

  float yoff = flying;
  for (int y = 0; y < rows; y++) {
    float xoff = 0;
    for (int x = 0; x < cols; x++) {
      terrain[x][y] = map(noise(xoff, yoff), 0, 1, -1000, spectrum[y] * height * sensitivity);
      xoff += 0.1;
    }
    yoff += 0.1;
  }

  background(0);
  noFill();
  
  int currentTime = millis();
  
  if (currentTime - prevTime >= colorDuration) {
    // Time for a new color gradient
    prevTime = currentTime;
    startColor = adjustColorWithAmplitude(random(1.0)); // Adjust color based on audio amplitude, use random(1.0) for demo purposes
    endColor = adjustColorWithAmplitude(random(1.0));
  }
  
  // Calculate the step value for the color transition
  float t = map(currentTime - prevTime, 0, colorDuration, 0, 1);
  println(t);

  translate(width / 2, height / 2.5);
  rotateX(PI / 8);
  translate(-w / 2, -h / 2);

  // Creating the triangles
  for (int y = 0; y < rows - 1; y++) {
    beginShape(TRIANGLE_STRIP);

    for (int x = 0; x < cols; x++) {
      
      // Calculate the interpolated color
      color vertexColor = lerpColor(startColor, endColor, t);

      // Adjust the color based on audio amplitude and add alpha transition
      //color vertexColor = adjustColorWithAmplitude(spectrum[y]);
      
      float alpha = map(y, 0, rows - 1, 0, 255);
      vertexColor = color(red(vertexColor), green(vertexColor), blue(vertexColor), alpha);
      stroke(vertexColor);
      fill(vertexColor);

      vertex(x * scl, y * scl, terrain[x][y]);
      vertex(x * scl, (y + 1) * scl, terrain[x][y + 1]); //vertex(x * scl, (y + 1) * scl, terrain[x][y + 1]);
    }
    endShape();
  }
}


