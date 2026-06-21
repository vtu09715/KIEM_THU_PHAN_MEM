class UserService {
  constructor(userRepository, emailService, logger) {
    this.userRepository = userRepository;
    this.emailService = emailService;
    this.logger = logger;
  }

  async registerUser(name, email, password) {
    if (!name || !email || !password) {
      throw new Error('Thiếu thông tin bắt buộc (name, email, password)');
    }

    // 1. Kiểm tra xem người dùng đã tồn tại chưa (Sử dụng UserRepository - cần Stub hoặc Fake)
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email đã được đăng ký');
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // Trong thực tế cần băm password, ở đây tối giản để tập trung vào test double
      createdAt: new Date()
    };

    // 2. Lưu vào CSDL (Sử dụng UserRepository - cần Fake hoặc Mock)
    await this.userRepository.save(newUser);

    // 3. Ghi log hoạt động (Sử dụng Logger - cần Dummy để tránh in rác ra màn hình test)
    if (this.logger) {
      this.logger.log(`Đăng ký thành công người dùng: ${email}`);
    }

    // 4. Gửi email chào mừng (Sử dụng EmailService - cần Mock để xác minh hành vi gửi)
    if (this.emailService) {
      await this.emailService.sendWelcomeEmail(email, name);
    }

    return newUser;
  }
}

module.exports = UserService;
