//Teal and White

import processing.sound.*;

//Mapping
int cols, rows;
int scl = 30;
int w = 800;
int h = 800;

float flying = 0;

float[][] terrain;

//Audio
FFT fft;
AudioIn in;
int bands = 512;
float[] spectrum = new float[bands];

color adjustColorWithAmplitude(float amplitude) {
  float hueValue = map(amplitude * 100, 0, 1, 0, 255);
  
  // time-based factor to the hue for delay
  float timeFactor = millis() / 500.0;
  hueValue += timeFactor;
  hueValue %= 255;
  return color(hueValue, 255, 255);
}

void setup() {
  fullScreen(P3D);
  frameRate(30);

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

  flying -= 0.1;

  float sensitivity = 10 + map(max(spectrum), 0, 1, 0, 10);

  float yoff = flying;
  for (int y = 0; y < rows; y++) {
    float xoff = 0;
    for (int x = 0; x < cols; x++) {
      terrain[x][y] = map(noise(xoff, yoff), 0, 1, -1000, spectrum[y] * height * sensitivity);
      xoff += 0.1;
    }
    yoff += 0.1;
  }

  float maxDistance = dist(0, 0, w, h);
  background(0);
  noFill();

  translate(width / 2, height / 2.5);
  rotateX(PI / 8);
  translate(-w / 2, -h / 2);

  // Creating the triangles
  for (int y = 0; y < rows - 1; y++) {
    beginShape(TRIANGLE_STRIP);

    for (int x = 0; x < cols; x++) {
      float distanceFromTopLeft = dist(0, 0, x * scl, y * scl);
      float colorLerpValue = distanceFromTopLeft / maxDistance;

      // Adjust the color based on audio amplitude and add alpha transition
      color vertexColor = adjustColorWithAmplitude(spectrum[y]);
      float alpha = map(y, 0, rows - 1, 0, 255);
      vertexColor = color(red(vertexColor), green(vertexColor), blue(vertexColor), alpha);
      stroke(vertexColor);
      fill(vertexColor);

      vertex(x * scl, y * scl, terrain[x][y]);
      vertex(x * scl, (y + 1) * scl, terrain[x][y + 1]);
    }
    endShape();
  }
}


