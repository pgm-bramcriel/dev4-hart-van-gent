#include <FastLED.h>

#define LED_PIN_1   6
#define LED_PIN_2   7
#define LED_PIN_3   8
#define NUM_LEDS    61
#define LED_TYPE    WS2812B
#define COLOR_ORDER GRB
#define BRIGHTNESS  120

CRGB leds1[NUM_LEDS];
CRGB leds2[NUM_LEDS];
CRGB leds3[NUM_LEDS];

// --- Trilmotoren ---
#define MOTOR_PIN_1  3
#define MOTOR_PIN_2  4

// --- Animation Variables ---
const int ANIM_INTERVAL = 25;
const int WAVE_WIDTH = 5;
int wavePos = -WAVE_WIDTH;
unsigned long lastAnimTime = 0;

// --- Sensor Configuration ---
const int pulsePin = A0;
const int pressurePin = A2;
const int THRESHOLD_HIGH = 150;
const int THRESHOLD_LOW  = 80;
unsigned long lastPrintTime = 0;

// --- Session Tracking ---
float sessionBPMs[300];
int sessionIndex = 0;
bool isSessionActive = false;
bool sessionFinishedFlag = false;

long runningSum = 0;
int sampleCount = 0;

// --- Trilmotor variabelen ---
float currentBPM = 0;
unsigned long lastBeatTime1 = 0;
unsigned long lastBeatTime2 = 0;
bool motor1On = false;
bool motor2On = false;

// Motor 2 fires on the off-beat (half a beat after motor 1)
const int MOTOR_ON_MS = 80;

void setup() {
  Serial.begin(9600);

  FastLED.addLeds<LED_TYPE, LED_PIN_1, COLOR_ORDER>(leds1, NUM_LEDS);
  FastLED.addLeds<LED_TYPE, LED_PIN_2, COLOR_ORDER>(leds2, NUM_LEDS);
  FastLED.addLeds<LED_TYPE, LED_PIN_3, COLOR_ORDER>(leds3, NUM_LEDS);
  FastLED.setBrightness(BRIGHTNESS);

  pinMode(MOTOR_PIN_1, OUTPUT);
  pinMode(MOTOR_PIN_2, OUTPUT);
  digitalWrite(MOTOR_PIN_1, LOW);
  digitalWrite(MOTOR_PIN_2, LOW);

  fillAllStrips(CRGB(255, 255, 0));
  FastLED.show();
}

void loop() {
  int pulseValue    = analogRead(pulsePin);
  int pressureValue = analogRead(pressurePin);

  // 1. SENSOR LOGIC MET HYSTERESIS
  if (!isSessionActive && pressureValue > THRESHOLD_HIGH) {
    isSessionActive = true;
    startNewSession();
  } else if (isSessionActive && pressureValue < THRESHOLD_LOW) {
    isSessionActive = false;
    endCurrentSession();
  }

  // 2. STATE UITVOERING
  if (isSessionActive) {
    processBPM(pulseValue);
    runWaveAnimation();
    updateMotors();
  } else {
    runSolidIdle();
    digitalWrite(MOTOR_PIN_1, LOW);
    digitalWrite(MOTOR_PIN_2, LOW);

    if (sessionFinishedFlag) {
      printSessionSummary();
      sessionFinishedFlag = false;
    }
  }

  delay(2);
}

// --- TRILMOTOR LOGICA ---

void updateMotors() {
  if (currentBPM <= 0) return;

  unsigned long beatInterval = (unsigned long)(60000.0 / currentBPM);
  unsigned long halfBeat     = beatInterval / 2;
  unsigned long now          = millis();

  // Motor 1: fires on every beat
  if (now - lastBeatTime1 >= beatInterval) {
    lastBeatTime1 = now;
    motor1On = true;
    digitalWrite(MOTOR_PIN_1, HIGH);
  }
  if (motor1On && (now - lastBeatTime1 >= MOTOR_ON_MS)) {
    motor1On = false;
    digitalWrite(MOTOR_PIN_1, LOW);
  }

  // Motor 2: fires on the off-beat (half interval offset)
  if (now - lastBeatTime2 >= beatInterval) {
    lastBeatTime2 = now;
    motor2On = true;
    digitalWrite(MOTOR_PIN_2, HIGH);
  }
  if (motor2On && (now - lastBeatTime2 >= MOTOR_ON_MS)) {
    motor2On = false;
    digitalWrite(MOTOR_PIN_2, LOW);
  }
}

// --- HELPERS ---

void fillAllStrips(CRGB color) {
  fill_solid(leds1, NUM_LEDS, color);
  fill_solid(leds2, NUM_LEDS, color);
  fill_solid(leds3, NUM_LEDS, color);
}

// --- LOGIC WRAPPERS ---

void startNewSession() {
  sessionFinishedFlag = false;
  sessionIndex  = 0;
  runningSum    = 0;
  sampleCount   = 0;
  wavePos       = -WAVE_WIDTH;
  lastPrintTime = millis();
  currentBPM    = 0;
  lastBeatTime1 = millis();
  // Offset motor 2 by half a beat so they alternate
  lastBeatTime2 = millis() - (currentBPM > 0 ? (unsigned long)(30000.0 / currentBPM) : 0);
  motor1On      = false;
  motor2On      = false;

  fillAllStrips(CRGB::Black);
  FastLED.show();

  Serial.println("\n--- Session Started ---");
}

void endCurrentSession() {
  sessionFinishedFlag = true;
  digitalWrite(MOTOR_PIN_1, LOW);
  digitalWrite(MOTOR_PIN_2, LOW);
  currentBPM = 0;
  motor1On   = false;
  motor2On   = false;

  fillAllStrips(CRGB(255, 220, 0));
  FastLED.show();

  Serial.println("--- Session Ended ---");
}

void runWaveAnimation() {
  if (millis() - lastAnimTime < ANIM_INTERVAL) return;
  lastAnimTime = millis();

  fillAllStrips(CRGB::Black);

  for (int i = 0; i < WAVE_WIDTH; i++) {
    int index = wavePos + i;
    if (index >= 0 && index < NUM_LEDS) {
      leds1[index] = CRGB(255, 220, 0);
      leds2[index] = CRGB(255, 220, 0);
      leds3[index] = CRGB(255, 220, 0);
    }
  }
  FastLED.show();

  wavePos++;
  if (wavePos >= NUM_LEDS) wavePos = -WAVE_WIDTH;
}

void runSolidIdle() {
  // endCurrentSession() already sets yellow; nothing extra needed
}

// --- DATA VERWERKING ---

void processBPM(int value) {
  runningSum += value;
  sampleCount++;

  if (millis() - lastPrintTime >= 1000) {
    if (sampleCount > 0) {
      float average = (float)runningSum / sampleCount;
      float bpm     = getSkewedBPM(average);
      currentBPM    = bpm;
      if (sessionIndex < 300) {
        sessionBPMs[sessionIndex] = bpm;
        sessionIndex++;
      }
      Serial.print("Current BPM: "); Serial.println(bpm);
    }
    runningSum    = 0;
    sampleCount   = 0;
    lastPrintTime = millis();
  }
}

float getSkewedBPM(float avg) {
  float cleanAvg = constrain(avg, 200, 500);
  if (cleanAvg <= 350) return map(cleanAvg, 200, 350, 50, 70);
  else                 return map(cleanAvg, 350, 500, 70, 120);
}

void printSessionSummary() {
  if (sessionIndex <= 2) return;

  float sortedBPMs[300];
  memcpy(sortedBPMs, sessionBPMs, sessionIndex * sizeof(float));
  sortArray(sortedBPMs, sessionIndex);

  float median       = sortedBPMs[sessionIndex / 2];
  float filteredSum  = 0;
  int   filteredCount = 0;

  for (int i = 0; i < sessionIndex; i++) {
    if (abs(sessionBPMs[i] - median) <= 15.0) {
      filteredSum += sessionBPMs[i];
      filteredCount++;
    }
  }

  if (filteredCount > 0) {
    Serial.println("--- SESSIE SAMENVATTING ---");
    Serial.print("Gemiddelde BPM: "); Serial.println(filteredSum / filteredCount);
    Serial.println("---------------------------");
  }
}

void sortArray(float a[], int size) {
  for (int i = 0; i < size - 1; i++) {
    for (int j = 0; j < size - i - 1; j++) {
      if (a[j] > a[j + 1]) {
        float temp = a[j];
        a[j]       = a[j + 1];
        a[j + 1]   = temp;
      }
    }
  }
}