#include <FastLED.h>

#define LED_PIN     6        
#define NUM_LEDS    15       
#define LED_TYPE    WS2812B  
#define COLOR_ORDER GRB      
#define BRIGHTNESS  120       

CRGB leds[NUM_LEDS];

// --- Animation Variables ---
const int ANIM_INTERVAL = 25; 
const int WAVE_WIDTH = 5;     
int wavePos = -WAVE_WIDTH;    
unsigned long lastAnimTime = 0;

// --- Sensor Configuration ---
const int pulsePin = A0;
const int pressurePin = A2;
const int THRESHOLD_HIGH = 150; // Pressure must cross this to START
const int THRESHOLD_LOW  = 80;  // Pressure must drop below this to STOP
unsigned long lastPrintTime = 0;

// --- Session Tracking ---
float sessionBPMs[300]; 
int sessionIndex = 0;
bool isSessionActive = false;
bool sessionFinishedFlag = false; 

// BPM calculation variables
long runningSum = 0;
int sampleCount = 0;

void setup() {
  Serial.begin(9600);
  FastLED.addLeds<LED_TYPE, LED_PIN, COLOR_ORDER>(leds, NUM_LEDS);
  FastLED.setBrightness(BRIGHTNESS);
  
  // Set initial state to Solid Yellow
  fill_solid(leds, NUM_LEDS, CRGB(255, 255, 0));
  FastLED.show();
}

void loop() {
  int pulseValue = analogRead(pulsePin);
  int pressureValue = analogRead(pressurePin);
  
  // 1. SENSOR LOGIC WITH HYSTERESIS (Prevents flickering)
  if (!isSessionActive && pressureValue > THRESHOLD_HIGH) {
    isSessionActive = true;
    startNewSession();
  }
  else if (isSessionActive && pressureValue < THRESHOLD_LOW) {
    isSessionActive = false;
    endCurrentSession();
  }

  // 2. STATE EXECUTION
  if (isSessionActive) {
    processBPM(pulseValue);
    runWaveAnimation();
  } else {
    runSolidIdle();
    
    if (sessionFinishedFlag) {
      printSessionSummary();
      sessionFinishedFlag = false;
    }
  }

  // Small delay for sensor stability
  delay(2); 
}

// --- LOGIC WRAPPERS ---

void startNewSession() {
  sessionFinishedFlag = false;
  sessionIndex = 0; 
  runningSum = 0;
  sampleCount = 0;
  wavePos = -WAVE_WIDTH; 
  lastPrintTime = millis();
  
  // Clear the strip immediately so the wave starts on BLACK
  fill_solid(leds, NUM_LEDS, CRGB::Black);
  FastLED.show();
  
  Serial.println("\n--- Session Started ---");
}

void endCurrentSession() {
  sessionFinishedFlag = true;
  // Force back to Solid Yellow immediately
  fill_solid(leds, NUM_LEDS, CRGB(255, 220, 0));
  FastLED.show();
  
  Serial.println("--- Session Ended ---");
}

void runWaveAnimation() {
  if (millis() - lastAnimTime < ANIM_INTERVAL) return;
  lastAnimTime = millis();

  // Draw frame
  fill_solid(leds, NUM_LEDS, CRGB::Black);
  for (int i = 0; i < WAVE_WIDTH; i++) {
    int index = wavePos + i;
    if (index >= 0 && index < NUM_LEDS) {
      leds[index] = CRGB(255, 220, 0); 
    }
  }
  FastLED.show();

  wavePos++;
  if (wavePos >= NUM_LEDS) wavePos = -WAVE_WIDTH;
}

void runSolidIdle() {
  // We don't need to call FastLED.show() constantly here because 
  // endCurrentSession() already set them to yellow once.
}

// --- DATA PROCESSING ---

void processBPM(int value) {
  runningSum += value;
  sampleCount++;

  if (millis() - lastPrintTime >= 1000) {
    if (sampleCount > 0) {
      float average = (float)runningSum / sampleCount;
      float bpm = getSkewedBPM(average);
      if (sessionIndex < 300) {
        sessionBPMs[sessionIndex] = bpm;
        sessionIndex++;
      }
      Serial.print("Current BPM: "); Serial.println(bpm);
    }
    runningSum = 0;
    sampleCount = 0;
    lastPrintTime = millis();
  }
}

float getSkewedBPM(float avg) {
  float cleanAvg = constrain(avg, 200, 500);
  if (cleanAvg <= 350) return map(cleanAvg, 200, 350, 50, 70);
  else return map(cleanAvg, 350, 500, 70, 120);
}

void printSessionSummary() {
  if (sessionIndex <= 2) return;
  float sortedBPMs[300];
  memcpy(sortedBPMs, sessionBPMs, sessionIndex * sizeof(float));
  sortArray(sortedBPMs, sessionIndex);
  float median = sortedBPMs[sessionIndex / 2];
  float filteredSum = 0;
  int filteredCount = 0;

  for (int i = 0; i < sessionIndex; i++) {
    if (abs(sessionBPMs[i] - median) <= 15.0) {
      filteredSum += sessionBPMs[i];
      filteredCount++;
    }
  }

  if (filteredCount > 0) {
    Serial.println("--- SESSION SUMMARY ---");
    Serial.print("Filtered Average BPM: "); Serial.println(filteredSum / filteredCount);
    Serial.println("-----------------------");
  }
}

void sortArray(float a[], int size) {
  for (int i = 0; i < size - 1; i++) {
    for (int j = 0; j < size - i - 1; j++) {
      if (a[j] > a[j + 1]) {
        float temp = a[j];
        a[j] = a[j + 1];
        a[j + 1] = temp;
      }
    }
  }
}