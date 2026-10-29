# Prime EQualizer by Piradex — Beatfreak Developer

New independent audio plugin research project.

## Status: v0.1.0 engineering prototype

The complete C++/JUCE source package has been created and locally unit-tested in the current ChatGPT deliverable. This GitHub directory is the project index; the full source package is supplied separately in the conversation as `PrimeEQualizer-Source-v0.1.zip`.

Implemented in supplied source package:
- Original 24-band IIR parametric EQ DSP (RBJ biquads), 8 basic shapes.
- Host-automatable JUCE parameters, state recall, interactive EQ curve, FFT 2048, output peak meter.
- CMake setup and initial GitHub Actions workflow templates for Windows VST3 and macOS VST3/AU.
- C++ DSP tests: passed locally (Linux).

**Not yet built or verified:** Windows VST3 and macOS AU binary bundles. **Not implemented:** Dynamic EQ, linear phase, Smart Ops, de-harsh, AAX, commercial signing/notarization.

The product specification is informed by the user-supplied Aurora 1.6 manual and the prior EQmotion Pro technical brief, but no proprietary Aurora code/assets are used.

For GitHub Actions and actual plugin builds, extract the source ZIP to the root of a standalone GitHub repository. A Windows runner and macOS runner are required; JUCE licensing and macOS signing credentials must be addressed before distribution.

## Next milestone
Import all ZIP files into a dedicated repository, run Windows/macOS CI, resolve compiler diagnostics, test the plugin in Studio One, validate audio continuity and GUI synchronization, then implement dynamics.