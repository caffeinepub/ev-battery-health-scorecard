# Battery Diagnosis

## Current State
- StartDiagnosis.tsx: fault selection with ~13 battery faults, maps faults to test cards
- ControllerDiagnostics.tsx: basic panel with battery voltage, current draw, controller temp, throttle signal, motor status inputs
- ServiceChecklist.tsx: checklist with Safety, Battery, Wiring, Motor, Brakes, Lights, Road Test
- BatteryTests.tsx: test modules for Voltage, Voltage Drop, IR, Temperature, BMS, Cell Balance, Insulation Resistance, Charging Circuit

## Requested Changes (Diff)

### Add
- More battery faults in StartDiagnosis (practical, field-relevant for 2W/3W EV technicians)
- More controller faults as selectable fault options
- Expanded practical fault checklist items in ServiceChecklist per category
- New controller fault test procedures in ControllerDiagnostics
- More practical step-by-step instructions in test cards

### Modify
- ServiceChecklist: expand each section with practical field-level checks a technician would actually perform
- StartDiagnosis: add more battery faults and controller-specific faults as selectable options
- ControllerDiagnostics: add more fault indicators, measurement fields, and practical test steps
- BatteryTests: improve step-by-step instructions to be more practical and tool-specific

### Remove
- Nothing removed

## Implementation Plan
1. StartDiagnosis.tsx: Add battery faults (e.g., Voltage Sag Under Load, Cell Reversal, Sulfation, Pack Imbalance After Charging, Charger Not Recognized, Regenerative Braking Fault) and controller faults (e.g., Controller Overheating, Phase Wire Short, MOSFET Failure, Throttle Signal Error, Hall Sensor Fault, Controller No Output, Error Code on Display, Low PWM Output)
2. ServiceChecklist.tsx: Expand each checklist category with practical items (e.g., Safety: PPE, HV gloves, lockout; Battery: connector torque, vent holes, swelling; Wiring: insulation damage, connector pins, cable routing; Motor: bearing noise, winding resistance, phase balance; Brakes: pad thickness, disc runout; Lights: all functional; Road Test: regen, acceleration, top speed, range)
3. ControllerDiagnostics.tsx: Add more fault sections -- Phase Output Test (measure U/V/W phase voltages), Hall Sensor Test (check hall signal A/B/C), MOSFET Check (gate drive voltages), Error Code Lookup table, Throttle Calibration Check
4. BatteryTests.tsx: Improve step-by-step instructions in each test card with practical tool usage and accept/reject criteria
