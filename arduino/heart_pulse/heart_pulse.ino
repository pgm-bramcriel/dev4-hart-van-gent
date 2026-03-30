const int pulsePin = A0;
unsigned long lastPrintTime = 0;

// Per-second variables
long runningSum = 0;
int sampleCount = 0;

// Session Tracking
float sessionBPMs[300]; // Stores up to 5 minutes (300 seconds) of data
int sessionIndex = 0;

bool isSessionActive = false;
bool zeroDetected = false;

void setup() {
  Serial.begin(115200);
}

float getSkewedBPM(float avg) {
  float cleanAvg = constrain(avg, 200, 500);
  if (cleanAvg <= 350) {
    return map(cleanAvg, 200, 350, 50, 70);
  } else {
    return map(cleanAvg, 350, 500, 70, 120);
  }
}

// Simple Bubble Sort to find Median
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

void loop() {
  int value = analogRead(pulsePin);

  if (!isSessionActive) {
    if (value == 0) {
      zeroDetected = true;
    } 
    else if (zeroDetected && value >= 200 && value <= 500) {
      isSessionActive = true;
      zeroDetected = false;
      sessionIndex = 0; // Reset session storage
      runningSum = 0;
      sampleCount = 0;
      lastPrintTime = millis();
      Serial.println("\n--- New session started ---");
    }
  }

  if (isSessionActive) {
    runningSum += value;
    sampleCount++;

    if (millis() - lastPrintTime >= 1000) {
      if (sampleCount > 0) {
        float average = (float)runningSum / sampleCount;
        float bpm = getSkewedBPM(average);
        
        // Store BPM for final filtering (if space permits)
        if (sessionIndex < 300) {
          sessionBPMs[sessionIndex] = bpm;
          sessionIndex++;
        }
        
        Serial.print("Current BPM: ");
        Serial.println(bpm);
      }
      runningSum = 0;
      sampleCount = 0;
      lastPrintTime = millis();
    }

    // --- SESSION END & FILTERING ---
    if (value >= 650) {
      isSessionActive = false;
      Serial.println("--- Session ended ---");

      if (sessionIndex > 2) {
        // 1. Sort a copy of the array to find median
        float sortedBPMs[300];
        memcpy(sortedBPMs, sessionBPMs, sessionIndex * sizeof(float));
        sortArray(sortedBPMs, sessionIndex);
        
        float median = sortedBPMs[sessionIndex / 2];
        
        // 2. Average only values within 15 BPM of the median (The Filter)
        float filteredSum = 0;
        int filteredCount = 0;
        float threshold = 15.0; 

        for (int i = 0; i < sessionIndex; i++) {
          if (abs(sessionBPMs[i] - median) <= threshold) {
            filteredSum += sessionBPMs[i];
            filteredCount++;
          }
        }

        float finalAvg = filteredSum / filteredCount;
        Serial.print("Median BPM: "); Serial.println(median);
        Serial.print("Filtered Session Average: "); Serial.println(finalAvg);
        Serial.print("Outliers Removed: "); Serial.println(sessionIndex - filteredCount);
      }
      Serial.println("--------------------------------------------");
    }
  }
  delay(10);
}