class UserRepository {
  constructor() {
    // Giả định kết nối tới MongoDB hoặc PostgreSQL thực tế
    this.connectionString = 'mongodb://localhost:27017/prod_db';
  }

  async findByEmail(email) {
    // Kết nối CSDL thật và tìm kiếm người dùng
    console.log(`[Database] Đang tìm kiếm user có email: ${email}`);
    throw new Error('Không thể kết nối CSDL thực tế trong môi trường kiểm thử đơn vị!');
  }

  async save(user) {
    // Kết nối CSDL thật và lưu thông tin người dùng
    console.log(`[Database] Đang lưu thông tin user vào MongoDB...`);
    throw new Error('Không thể kết nối CSDL thực tế trong môi trường kiểm thử đơn vị!');
  }
}

module.exports = UserRepository;
