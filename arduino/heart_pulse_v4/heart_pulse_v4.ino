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

// ======================================================
// TRILMOTOREN
// ======================================================

#define MOTOR_PIN_1  3
#define MOTOR_PIN_2  4

// ======================================================
// ANIMATIE
// ======================================================

const int ANIM_INTERVAL   = 25;
const int SESSION_DURATION_MS = 8000;

unsigned long fillStartTime = 0;
unsigned long lastAnimTime  = 0;

// ======================================================
// SENSOR CONFIG
// ======================================================

const int pulsePin  = A0;
const int TOUCH_PIN = 2;

unsigned long lastPrintTime = 0;

// ======================================================
// SESSION TRACKING
// ======================================================

float sessionBPMs[300];

int  sessionIndex        = 0;
bool isSessionActive     = false;
bool sessionFinishedFlag = false;

long runningSum = 0;
int  sampleCount = 0;

// ======================================================
// SESSION GRACE PERIOD
// ======================================================

const unsigned long SESSION_GRACE_PERIOD_MS = 3000;
unsigned long nextSessionAllowedAtMs = 0;

// ======================================================
// BPM / MOTORS
// ======================================================

float currentBPM = 0;

unsigned long lastBeatTime1 = 0;
unsigned long lastBeatTime2 = 0;

bool motor1On = false;
bool motor2On = false;

const int MOTOR_ON_MS = 80;

// ======================================================
// SETUP
// ======================================================

void setup() {

  Serial.begin(9600);

  FastLED.addLeds<LED_TYPE, LED_PIN_1, COLOR_ORDER>(leds1, NUM_LEDS);
  FastLED.addLeds<LED_TYPE, LED_PIN_2, COLOR_ORDER>(leds2, NUM_LEDS);
  FastLED.addLeds<LED_TYPE, LED_PIN_3, COLOR_ORDER>(leds3, NUM_LEDS);

  FastLED.setBrightness(BRIGHTNESS);

  pinMode(MOTOR_PIN_1, OUTPUT);
  pinMode(MOTOR_PIN_2, OUTPUT);
  pinMode(TOUCH_PIN, INPUT);

  digitalWrite(MOTOR_PIN_1, LOW);
  digitalWrite(MOTOR_PIN_2, LOW);

  fillAllStrips(CRGB(255, 255, 0));
  FastLED.show();
}

// ======================================================
// LOOP
// ======================================================

void loop() {

  int pulseValue = analogRead(pulsePin);
  int touchState = digitalRead(TOUCH_PIN);
  const unsigned long nowMs = millis();

  // ====================================================
  // START SESSION
  // ====================================================

  const bool gracePeriodOver = (long)(nowMs - nextSessionAllowedAtMs) >= 0;
  if (!isSessionActive && gracePeriodOver && touchState == HIGH) {
    isSessionActive = true;
    startNewSession();
  }

  // ====================================================
  // SESSION ACTIVE
  // ====================================================

  if (isSessionActive) {

    // Stop immediately if touch/pressure is released (session cancelled)
    if (touchState == LOW) {

      isSessionActive = false;
      cancelCurrentSession();
    }
    // Na exact 8 seconden stoppen
    else if (millis() - fillStartTime >= SESSION_DURATION_MS) {

      isSessionActive = false;
      endCurrentSession();
    }
    else {

      processBPM(pulseValue);
      runFillAnimation();
      updateMotors();
    }
  }

  // ====================================================
  // IDLE STATE
  // ====================================================

  else {

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

// ======================================================
// TRILMOTOR LOGICA
// ======================================================

void updateMotors() {

  if (currentBPM <= 0) return;

  unsigned long beatInterval = (unsigned long)(60000.0 / currentBPM);
  unsigned long now = millis();

  // --- Motor 1 ---

  if (now - lastBeatTime1 >= beatInterval) {

    lastBeatTime1 = now;

    motor1On = true;

    digitalWrite(MOTOR_PIN_1, HIGH);
  }

  if (motor1On && (now - lastBeatTime1 >= MOTOR_ON_MS)) {

    motor1On = false;

    digitalWrite(MOTOR_PIN_1, LOW);
  }

  // --- Motor 2 ---

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

// ======================================================
// HELPERS
// ======================================================

void fillAllStrips(CRGB color) {

  fill_solid(leds1, NUM_LEDS, color);
  fill_solid(leds2, NUM_LEDS, color);
  fill_solid(leds3, NUM_LEDS, color);
}

// ======================================================
// SESSION START
// ======================================================

void startNewSession() {

  sessionFinishedFlag = false;

  sessionIndex = 0;

  runningSum  = 0;
  sampleCount = 0;

  fillStartTime = millis();
  lastPrintTime = millis();

  currentBPM = 0;

  lastBeatTime1 = millis();
  lastBeatTime2 = millis();

  motor1On = false;
  motor2On = false;

  fillAllStrips(CRGB::Black);

  FastLED.show();

  Serial.println();
  Serial.println("--- Session Started ---");
}

// ======================================================
// SESSION END
// ======================================================

void endCurrentSession() {

  sessionFinishedFlag = true;
  nextSessionAllowedAtMs = millis() + SESSION_GRACE_PERIOD_MS;

  digitalWrite(MOTOR_PIN_1, LOW);
  digitalWrite(MOTOR_PIN_2, LOW);

  currentBPM = 0;

  motor1On = false;
  motor2On = false;

  fillAllStrips(CRGB(255, 220, 0));

  FastLED.show();

  // BELANGRIJK:
  // Eerst average printen
  printSessionSummary();

  // Daarna session ended
  Serial.println("--- Session Ended ---");
}

// ======================================================
// SESSION CANCEL
// ======================================================

void cancelCurrentSession() {

  sessionFinishedFlag = false;
  nextSessionAllowedAtMs = millis() + SESSION_GRACE_PERIOD_MS;

  digitalWrite(MOTOR_PIN_1, LOW);
  digitalWrite(MOTOR_PIN_2, LOW);

  currentBPM = 0;

  motor1On = false;
  motor2On = false;

  fillAllStrips(CRGB(255, 220, 0));
  FastLED.show();

  sessionIndex = 0;
  runningSum = 0;
  sampleCount = 0;

  Serial.println("--- Session Cancelled ---");
}

// ======================================================
// FILL ANIMATIE
// ======================================================

void runFillAnimation() {

  if (millis() - lastAnimTime < ANIM_INTERVAL) return;

  lastAnimTime = millis();

  unsigned long elapsed = millis() - fillStartTime;

  int ledsToLight = map(
    elapsed,
    0,
    SESSION_DURATION_MS,
    0,
    NUM_LEDS
  );

  ledsToLight = constrain(ledsToLight, 0, NUM_LEDS);

  fillAllStrips(CRGB::Black);

  for (int i = 0; i < ledsToLight; i++) {

    leds1[i] = CRGB(255, 220, 0);
    leds2[i] = CRGB(255, 220, 0);
    leds3[i] = CRGB(255, 220, 0);
  }

  FastLED.show();
}

// ======================================================
// IDLE
// ======================================================

void runSolidIdle() {
  // idle = gele strip
}

// ======================================================
// BPM VERWERKING
// ======================================================

void processBPM(int value) {

  runningSum += value;
  sampleCount++;

  if (millis() - lastPrintTime >= 1000) {

    if (sampleCount > 0) {

      float average = (float)runningSum / sampleCount;

      float bpm = getSkewedBPM(average);

      currentBPM = bpm;

      if (sessionIndex < 300) {

        sessionBPMs[sessionIndex] = bpm;

        sessionIndex++;
      }

      Serial.print("Current BPM: ");
      Serial.println(bpm);
    }

    runningSum  = 0;
    sampleCount = 0;

    lastPrintTime = millis();
  }
}

// ======================================================
// BPM MAPPING
// ======================================================

float getSkewedBPM(float avg) {

  float cleanAvg = constrain(avg, 200, 500);

  if (cleanAvg <= 350) {

    return map(cleanAvg, 200, 350, 50, 70);
  }
  else {

    return map(cleanAvg, 350, 500, 70, 120);
  }
}

// ======================================================
// SESSION SUMMARY
// ======================================================

void printSessionSummary() {

  if (sessionIndex <= 2) return;

  float sortedBPMs[300];

  memcpy(
    sortedBPMs,
    sessionBPMs,
    sessionIndex * sizeof(float)
  );

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

    float averageBPM = filteredSum / filteredCount;

    Serial.print("Average BPM: ");
    Serial.println(averageBPM);
  }
}

// ======================================================
// SORT
// ======================================================

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