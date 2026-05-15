# MusicSpot - Advanced React Native Music Player

MusicSpot is a high-performance, professional-grade music player built with React Native and Expo. It features a stunning, premium UI with smooth animations, background audio playback, and comprehensive local/online music management.

![App Header](https://via.placeholder.com/1000x400?text=MusicSpot+Music+Player)

## ✨ Features

- 🎵 **High-Fidelity Playback**: Background audio support with native media controls.
- 📂 **Local Library**: Scan and play music directly from your device storage.
- 🔍 **Online Discovery**: Search and stream millions of tracks via iTunes API.
- 📜 **Playlist Management**: Create, rename, and manage custom playlists.
- 🎨 **Premium UI**: Glassmorphism effects, dynamic gradients, and smooth reanimated transitions.
- 🌓 **Theming**: Intelligent Dark/Light mode support.
- 🛠️ **Advanced Controls**: Queue management, shuffle/repeat, and visualizers.

## 🏗️ Architecture (SOLID Principles)

The codebase has been meticulously refactored to follow Clean Code and SOLID principles:

- **S (Single Responsibility)**: Monolithic contexts have been decomposed into specialized services (`StorageService`, `PlaylistService`, `QueueService`).
- **O (Open/Closed)**: UI components like the `MenuScreen` are configuration-driven, allowing for extension without modification.
- **L (Liskov Substitution)**: Consistent interfaces for both local and online tracks.
- **I (Interface Segregation)**: Type-safe development with modular TypeScript interfaces.
- **D (Dependency Inversion)**: Orchestration layers (Contexts) depend on abstractions (Services) rather than low-level implementation details.

## 📁 Project Structure

```text
src/
├── api/           # External service integrations (iTunes)
├── components/    # Atomic UI components (common, library, player)
├── constants/     # Global layout and storage tokens
├── context/       # State orchestration layers
├── hooks/         # Custom business logic hooks
├── navigation/    # Stack and Tab navigation configurations
├── screens/       # Feature-based screen modules
├── services/      # Stateless logic services (Pure functions)
├── theme/         # Color palettes and typography
├── types/         # TypeScript interface definitions
└── utils/         # Helper functions and native bridges
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Expo CLI
- Android Studio / Xcode (for native builds)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/MusicPlayer.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize native modules:
   ```bash
   npx expo prebuild
   ```

### Running the App

- **Development Build**:
  ```bash
  npx expo run:android # or run:ios
  ```
- **Release Build (Android)**:
  ```bash
  npx expo run:android --variant release
  ```

## 🛠️ Tech Stack

- **Framework**: React Native (Expo)
- **Audio Core**: `react-native-track-player`
- **Animations**: `react-native-reanimated`, `expo-linear-gradient`
- **Navigation**: `@react-navigation/native`
- **Persistence**: `@react-native-async-storage/async-storage`
- **UI Components**: Custom Vanilla CSS with Reanimated

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ by [Moataz Elsaid]
