const UserService = require('./src/user.service');
const Logger = require('./src/logger');

// Giả lập một Database chạy trong bộ nhớ (Fake Database) để chương trình chạy được trực tiếp
class InMemoryUserRepository {
  constructor() {
    this.users = [];
  }
  async findByEmail(email) {
    return this.users.find(u => u.email === email) || null;
  }
  async save(user) {
    this.users.push(user);
    return user;
  }
}

// Giả lập Dịch vụ gửi mail không kết nối SMTP thật để tránh treo chương trình
class SimulatedEmailService {
  async sendWelcomeEmail(email, name) {
    console.log(`[Email] Gửi email chào mừng thành công tới ${name} (${email})!`);
    return true;
  }
}

async function main() {
  const logger = new Logger();
  const db = new InMemoryUserRepository();
  const emailService = new SimulatedEmailService();

  // Khởi tạo UserService bằng cách tiêm các dependency vào
  const userService = new UserService(db, emailService, logger);

  console.log('--- KHỞI ĐẦU CHƯƠNG TRÌNH ĐĂNG KÝ NGƯỜI DÙNG ---');

  try {
    // Đăng ký người dùng thứ nhất
    console.log('\n1. Đăng ký tài khoản thứ nhất...');
    const user1 = await userService.registerUser('Nguyen Van A', 'a@example.com', 'mypassword123');
    console.log('Kết quả trả về:', user1);

    // Đăng ký người dùng thứ hai
    console.log('\n2. Đăng ký tài khoản thứ hai...');
    const user2 = await userService.registerUser('Tran Thi B', 'b@example.com', 'securepass999');
    console.log('Kết quả trả về:', user2);

    // Đăng ký người dùng trùng email (để xem lỗi văng ra)
    console.log('\n3. Đăng ký trùng email a@example.com...');
    await userService.registerUser('Nguyen Van Trung', 'a@example.com', 'anotherpassword');

  } catch (error) {
    logger.error(`Đăng ký thất bại: ${error.message}`);
  }

  console.log('\n--- KẾT THÚC CHƯƠNG TRÌNH ---');
}

main();
