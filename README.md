# ft_transcendence

## 🌟 Proje Hakkında | About the Project

### 🇹🇷 Türkçe

ft_transcendence, çok oyunculu bir Pong oyunu platformudur. Mikroservis mimarisi kullanılarak geliştirilmiş modern bir web uygulamasıdır. Kullanıcılar gerçek zamanlı olarak Pong oynayabilir, sohbet edebilir ve sosyal etkileşimde bulunabilirler.

### 🇬🇧 English

ft_transcendence is a comprehensive multiplayer Pong game platform developed using microservices architecture. This modern web application allows users to play real-time Pong matches against other players while providing robust social features including friend management, real-time chat, and notifications. The application is fully containerized using Docker and Docker Compose, making it easily deployable and scalable.

## 🏗️ Sistem Mimarisi | System Architecture

### Mikroservisler | Microservices:

1. **Frontend Service**
   - Vanilla JavaScript tabanlı kullanıcı arayüzü
   - SPA (Single Page Application) mimarisi
   - Bootstrap ile responsive tasarım
   - Modüler JavaScript yapısı
   - Custom router implementation for client-side navigation
   - Bootstrap-based responsive UI with modern design principles
   - Modular JavaScript architecture with dynamic content loading
   - Client-side state management

2. **Auth Service**
   - Kullanıcı kimlik doğrulama ve yetkilendirme
   - OAuth2.0 entegrasyonu
   - JWT token yönetimi
   - Comprehensive authentication system with local and OAuth strategies
   - Two-factor authentication (2FA) implementation
   - Secure password management with encryption
   - Session management using JWT tokens

3. **Game Service**
   - Pong oyun mantığı
   - Real-time oyun eşleştirme
   - Skor takibi
   - Real-time Pong game implementation with WebSocket
   - Player matchmaking system with game lobbies
   - Game state synchronization across clients
   - Game history and statistics tracking
   - Spectator mode for watching ongoing matches

4. **User Service**
   - Kullanıcı profil yönetimi
   - Kullanıcı istatistikleri
   - Full user profile management with customizable avatars
   - User statistics tracking (wins, losses, ranking)
   - User search functionality
   - Profile visibility settings
   - User activity logging

5. **Friend Service**
   - Arkadaşlık sistemi
   - Sosyal etkileşimler
   - Comprehensive friend management system
   - Friend request handling (send, accept, reject)
   - Friends list with online status indicators
   - Blocking functionality
   - Friend activity feed

6. **Notification Service**
   - Real-time bildirimler
   - Etkinlik takibi
   - Real-time notification delivery system
   - Multiple notification types (friend requests, game invites, etc.)
   - Notification preferences management
   - Read/unread status tracking

7. **Mail Service**
   - E-posta bildirimleri
   - Doğrulama e-postaları
   - Email verification for new accounts
   - Password reset functionality
   - System notifications and updates
   - Email template system with multilingual support

8. **Translation Service**
   - Çoklu dil desteği
   - Dinamik içerik çevirisi
   - Multilingual support across the entire application
   - Dynamic content translation
   - Language preference settings
   - Translation caching for performance optimization

9. **Gateway Service**
   - API Gateway
   - İstek yönlendirme
   - Yük dengeleme
   - Centralized API gateway for routing requests
   - Request/response transformation
   - Service discovery
   - Load balancing across service instances
   - Rate limiting and throttling protection

10. **Monitoring Service**
    - Sistem izleme
    - Performans analizi
    - Comprehensive system monitoring with Prometheus
    - Performance metrics visualization with Grafana
    - Real-time service health checks
    - Automated alerting system
    - Log aggregation and analysis

## 🛠️ Teknoloji Yığını | Technology Stack

### Backend:
- Python (FastAPI)
- PostgreSQL
- Redis
- WebSocket
- JWT Authentication

### Frontend:
- Vanilla JavaScript
- HTML5
- CSS3
- Bootstrap 5
- Fetch API
- Custom Router

### DevOps:
- Docker
- Docker Compose
- Nginx
- Prometheus
- Grafana

## 🚀 Kurulum | Installation

### Gereksinimler | Requirements:
- Docker
- Docker Compose
- Make

### Kurulum Adımları | Installation Steps:

```bash
# Projeyi klonlayın | Clone the project
git clone [repository-url]

# Proje dizinine gidin | Navigate to project directory
cd ft_transcendence

# Servisleri başlatın | Start services
make up

# Servisleri durdurmak için | To stop services
make down
```

## 🎮 Özellikler | Features

### 🇹🇷 Türkçe
- Real-time Pong oyunu
- Kullanıcı kimlik doğrulama ve yetkilendirme
- Arkadaş sistemi ve sosyal özellikler
- Real-time sohbet
- Çoklu dil desteği
- Performans izleme ve analitik
- Responsive tasarım

### 🇬🇧 English

#### Core Features
- **Real-time Pong Game**: Enjoy classic Pong gameplay with modern features including:
  - Real-time multiplayer matches with WebSocket communication
  - Game customization options (speed, difficulty)
  - Match history and statistics
  - Spectator mode for watching ongoing matches
  - Tournament system for competitive play

- **User Management**:
  - Comprehensive user profiles with customizable avatars
  - User statistics and rankings
  - Achievement system
  - Activity history

- **Authentication & Security**:
  - Secure registration and login process
  - OAuth2.0 integration for social login
  - Two-factor authentication (2FA)
  - Password recovery system
  - Email verification

- **Social Features**:
  - Friend management system (add, remove, block)
  - Real-time chat functionality (private and group)
  - Online status indicators
  - Game invitations

- **Multilingual Support**:
  - Full application translation (English, Turkish, and more)
  - User language preference settings
  - Dynamic content translation

- **Responsive Design**:
  - Mobile-friendly interface
  - Adaptive layouts for different screen sizes
  - Consistent user experience across devices

## 🔒 Güvenlik | Security

- JWT tabanlı kimlik doğrulama
- OAuth2.0 entegrasyonu
- Rate limiting
- CORS politikaları
- Güvenli şifre yönetimi
- JWT-based authentication with proper token management
- OAuth2.0 integration for secure third-party authentication
- Comprehensive rate limiting to prevent abuse
- Properly configured CORS policies
- Secure password handling with encryption
- Protection against common web vulnerabilities (XSS, CSRF)
- Input validation and sanitization

## 📈 Ölçeklenebilirlik | Scalability

- Mikroservis mimarisi
- Yük dengeleme
- Docker container orchestration
- Önbellek yönetimi
- Microservices architecture enabling horizontal scaling
- Load balancing across service instances
- Docker containerization for consistent deployment
- Efficient caching strategies for performance optimization
- Database connection pooling
- Stateless service design for easy replication

## 📊 API Documentation

The ft_transcendence project provides comprehensive API endpoints for all services. Below are the core endpoints for the Auth and Friend services:

### Auth Service Endpoints

- `POST /api/auth/signup/` - Register a new user
- `POST /api/auth/signin/` - Authenticate a user
- `POST /api/auth/twofactor/` - Verify two-factor authentication
- `GET /api/auth/signout/` - Sign out a user

### User Service Endpoints

- `GET /api/user/get/` - Get all users
- `GET /api/user/getuser/<username>/` - Get a specific user's profile

### Friend Service Endpoints

- `POST /api/friend/send_friend_request/` - Send a friend request
- `GET /api/friend/list_friend_requests/<username>/` - List all friend requests
- `GET /api/friend/friends/<username>/` - Get user's friends list
- `POST /api/friend/accept_friend_request/` - Accept a friend request
- `POST /api/friend/reject_friend_request/` - Reject a friend request

For detailed request/response formats and authentication requirements, please refer to the full API documentation in each service's directory.

## 🤝 Katkıda Bulunma | Contributing

Projeye katkıda bulunmak için lütfen bir Issue açın veya Pull Request gönderin.

We welcome contributions to the ft_transcendence project! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows our coding standards and includes appropriate tests.

## 📝 Lisans | License

none