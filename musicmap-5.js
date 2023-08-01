import processing.sound.*;

//Mapping
int cols, rows;
int scl = 30;
int w = 1600;
int h = 1600;

float flying = 0;

float[][] terrain;

//Audio
FFT fft;
AudioIn in;
int bands = 512;
float[] spectrum = new float[bands];

color adjustColorWithAmplitude(float amplitude, float time) {
  var elapsedTime = time/100;  
  var colorTime = time/1000;
  
  float hueValue = map(amplitude*elapsedTime, 1, 1, 1000, 50); // Set hue value for orange range (30 to 50)
  float saturation = map(amplitude*2000, 0, 1, 600, 255); // Adjust saturation for varying colors
  float brightness = map(amplitude*200, 255, 255, 255, 255); // Adjust brightness for varying colors
  return color(hueValue, saturation, brightness);
}

int fadeDuration = 3000; // 3 seconds in milliseconds  
int fadeStart; // Time when the fade starts

void setup() {
  fullScreen(P3D);
  frameRate(12);
  fadeStart = millis();

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

  background(0);
  noFill();

  translate(width / 2, height / 2.5);
  rotateX(PI / 8);
  translate(-w / 2, -h / 2);

  // Creating the triangles
  for (int y = 0; y < rows - 1; y++) {
    beginShape(TRIANGLE_STRIP);

    for (int x = 0; x < cols; x++) {

      float elapsedTime = (millis() - fadeStart)/1000.0;
      println("KILROY "+elapsedTime);
      // Adjust the color based on audio amplitude and add alpha transition
      color vertexColor = adjustColorWithAmplitude(spectrum[y], elapsedTime);
      float alpha = map(y, 0, rows - 1, 0, 255);
      vertexColor = color(red(vertexColor), green(vertexColor), blue(vertexColor), alpha);
      stroke(vertexColor);
      fill(vertexColor);

      vertex(x * scl, y * scl, terrain[x][y]);
      vertex(x * scl, (y + elapsedTime) * scl, terrain[x][y + 1]);
    }
    endShape();
  }
}


