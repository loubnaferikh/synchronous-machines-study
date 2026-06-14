# Synchronous Machines Study

![HTML5](https://img.shields.io/badge/HTML5-Static%20Web%20App-orange)
![CSS3](https://img.shields.io/badge/CSS3-Responsive%20Design-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-Interactive%20Calculations-yellow)
![Canvas](https://img.shields.io/badge/Canvas-Vector%20Diagrams-informational)
![Status](https://img.shields.io/badge/Status-Academic%20Project-success)

## Live Demo

The application is available online through GitHub Pages:

**[Open the live application](https://synchronous-machines-study.netlify.app/)**

## Overview

**Synchronous Machines Study** is an interactive web application designed for the study and visualization of synchronous machines. The project focuses on the construction, animation, and interpretation of classical vector diagrams used in electrical machine analysis.

The application allows users to study both **smooth-pole** and **salient-pole** synchronous machines by entering machine parameters, operating conditions, and experimental test data. It then generates the corresponding diagrams and numerical results in a clear, interactive, and educational interface.

This project was developed as an academic engineering mini-project to connect theoretical modeling, experimental tests, and graphical interpretation in a single web-based tool.

## Purpose of the Project

The main objective of this application is to make the analysis of synchronous machines more accessible and easier to understand. Instead of performing only manual diagram construction, the user can interact with the models, modify parameters, visualize the impact of operating conditions, and follow the construction of each diagram step by step.

The platform helps users understand:

- The relationship between stator voltage, armature current, internal electromotive force, and excitation current.
- The effect of load type and power factor on the machine behavior.
- The difference between smooth-pole and salient-pole synchronous machines.
- The role of experimental tests in the identification of machine parameters.
- The construction logic behind classical vector diagrams.

## Supported Machine Types

### Smooth-Pole Synchronous Machines

Smooth-pole machines are generally associated with high-speed operation and are commonly used in large alternators driven by steam or gas turbines.

Implemented methods:

- **Behn-Eschenburg diagram**
- **Potier diagram**

### Salient-Pole Synchronous Machines

Salient-pole machines are typically used in low-speed applications, such as hydroelectric alternators or synchronous machines with a large number of poles.

Implemented methods:

- **Two-reactance diagram**
- **Blondel diagram**

## Main Features

### Interactive Web Interface

- Static web application accessible directly from the browser.
- Clear navigation between the home page, machine selection page, and configuration pages.
- Separate study paths for smooth-pole and salient-pole machines.
- Responsive layout suitable for different screen sizes.

### Machine and Operating Parameters

The application allows the user to define the main machine and operating parameters, including:

- Machine type.
- Number of phases.
- Number of poles or pole pairs.
- Frequency.
- Stator resistance.
- Supply voltage.
- Armature current.
- Power factor.
- Load type: inductive, capacitive, or resistive.
- Operating mode: generator or motor.

### Experimental Data Input

The application uses classical experimental tests required for synchronous machine analysis:

- No-load test.
- Short-circuit test.
- Zero power factor test.
- Slip test for salient-pole machines.

Users can add, modify, and remove experimental data rows directly from the interface.

### Dynamic Diagram Generation

The diagrams are generated dynamically using the **HTML5 Canvas API**. This allows precise graphical rendering of vectors, characteristic curves, construction points, axes, and intermediate steps.

### Step-by-Step Animation

For better understanding, the application includes animated construction of the diagrams. The user can visualize the progressive building of the diagram and identify the role of each vector or construction point.

### Numerical Results

The application computes and displays the main electrical quantities associated with each method, such as:

- Internal electromotive force.
- Load angle.
- Synchronous reactance.
- Leakage reactance.
- Armature reaction coefficient.
- Direct-axis and quadrature-axis reactances.
- Excitation current.
- Intermediate graphical construction values.

## Mathematical Models

### Behn-Eschenburg Model

The Behn-Eschenburg model is used for smooth-pole synchronous machines under the assumption of magnetic linearity.

```math
E = V + R_s I + jX_s I
```

This model provides a simplified representation of the machine by grouping the leakage flux and armature reaction effects into a single synchronous reactance.

### Potier Model

The Potier model improves the analysis by taking magnetic saturation into account and separating the leakage reactance from the armature reaction effect.

```math
J = J_r + \alpha I
```

It uses no-load, short-circuit, and zero power factor test data to estimate the required excitation current more accurately.

### Two-Reactance Model

The two-reactance model is used for salient-pole synchronous machines. It introduces different reactances along the direct and quadrature axes to represent the magnetic anisotropy of the rotor.

```math
E = V + R_s I + jX_d I_d + jX_q I_q
```

### Blondel Model

The Blondel diagram provides a more detailed analysis of salient-pole machines by separating the longitudinal and transverse electromagnetic effects.

```math
E_r = E_{lr} + E_{tr}
```

This approach allows a more representative interpretation of the internal behavior of salient-pole synchronous machines.

## Technologies Used

| Technology | Role |
|---|---|
| **HTML5** | Application structure |
| **CSS3** | Styling, layout, transitions, and responsive design |
| **JavaScript** | Calculations, logic, interactivity, and data handling |
| **Canvas API** | Dynamic rendering of diagrams and vectors |
| **Google Fonts** | Typography |

## Project Structure

```text
synchronous-machines-study/
│
├── index.html             # Main application page
├── style.css              # Styles, layout, colors, and responsive design
├── jsPoleLisse.js         # Smooth-pole machine calculations and diagrams
├── jsPoleSaillant.js      # Salient-pole machine calculations and diagrams
├── Logo-ENP.png           # Institutional/project logo
└── README.md              # Project documentation
```

## Getting Started

### Option 1: Use the Online Version

Open the deployed application directly:

```text
https://loubnaferikh.github.io/synchronous-machines-study/
```

### Option 2: Run Locally

Clone the repository:

```bash
git clone https://github.com/loubnaferikh/synchronous-machines-study.git
cd synchronous-machines-study
```

Open the project by double-clicking:

```text
index.html
```

Or run it with a local development server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## How to Use the Application

1. Open the application from the live demo or locally.
2. Click **Commencer l’étude**.
3. Select the type of synchronous machine:
   - Smooth-pole machine.
   - Salient-pole machine.
4. Enter the machine parameters and operating conditions.
5. Add the required experimental test data.
6. Select the diagram to generate.
7. Launch the calculation and display the diagram.
8. Use the animation controls to follow the construction step by step.
9. Analyze the displayed numerical and graphical results.

## Engineering Choices

The project was designed with the following engineering choices:

- **Static architecture** to make deployment simple and reliable through GitHub Pages.
- **Separation of JavaScript logic by machine type** to improve maintainability.
- **Canvas-based rendering** to allow custom vector drawing and precise diagram construction.
- **Structured forms** to organize the input process clearly.
- **Interactive animations** to support learning and visual interpretation.
- **Responsive design** to improve usability across screen sizes.

## Academic Context

This project was developed as part of an electrical engineering study on synchronous machines. It combines theoretical modeling, experimental test interpretation, and interactive visualization to support the understanding of synchronous machine behavior in steady-state operation.

The implemented diagrams are based on classical methods used in the study of synchronous machines:

- Behn-Eschenburg method.
- Potier method.
- Two-reactance method.
- Blondel method.

## Limitations

- The application is intended for academic and educational use.
- The results depend on the accuracy of the input parameters and experimental data.
- The implemented models are based on steady-state analysis.
- The application does not replace laboratory measurements or professional simulation tools.
- Advanced dynamic behavior and transient analysis are not included in the current version.

## Future Improvements

Possible improvements for future versions include:

- Exporting calculated results as PDF or CSV files.
- Exporting diagrams as image files.
- Adding more detailed validation of user inputs.
- Adding predefined examples for each diagram.
- Improving error messages and user guidance.
- Adding unit tests for the calculation functions.
- Providing bilingual documentation in English and French.

## Authors

Academic mini-project carried out by:

- Loubna FERIKH

Supervised by:

- Kamel BOUGHRARA

## License

This project is provided for academic and educational purposes.

If the project is intended to be reused, modified, or distributed, it is recommended to add an appropriate open-source license such as MIT, Apache-2.0, or GPL-3.0.
