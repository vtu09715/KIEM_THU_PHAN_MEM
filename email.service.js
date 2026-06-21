class EmailService {
  async sendWelcomeEmail(email, name) {
    // Mô phỏng việc kết nối SMTP thực tế và gửi mail
    console.log(`Đang kết nối SMTP Server...`);
    console.log(`Đang gửi email chào mừng tới ${name} (${email})...`);
    // Giả định quá trình tốn thời gian và có thể thất bại nếu mạng lỗi
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return true;
  }
}

module.exports = EmailService;
