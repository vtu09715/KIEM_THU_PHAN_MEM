const UserService = require('../src/user.service');

describe('User Registration Service Tests using Test Doubles', () => {

  // ==========================================
  // 1. DUMMY DEMONSTRATION
  // ==========================================
  describe('Dummy Test Double Demonstration', () => {
    it('should register user successfully when dummy logger is used (we do not care about logging)', async () => {
      // DUMMY: Đối tượng truyền vào chỉ để thỏa mãn tham số đầu vào của constructor.
      // Nó không bao giờ được tương tác hoặc không ảnh hưởng gì tới logic chính đang kiểm thử.
      const dummyLogger = {
        log: () => {}, // Hàm rỗng, không làm gì cả
        error: () => {}
      };

      // Để chạy được test này, chúng ta cần FakeUserRepository và FakeEmailService
      const fakeDb = {
        users: [],
        async findByEmail(email) { return null; },
        async save(user) { this.users.push(user); return user; }
      };

      const dummyEmailService = {
        async sendWelcomeEmail() { return true; }
      };

      const userService = new UserService(fakeDb, dummyEmailService, dummyLogger);
      
      const result = await userService.registerUser('Alex Jones', 'alex@example.com', '123456');
      
      expect(result.email).toBe('alex@example.com');
      // DummyLogger hoàn thành nhiệm vụ giúp constructor không bị lỗi mà không cần in log ra màn hình test.
    });
  });

  // ==========================================
  // 2. FAKE DEMONSTRATION
  // ==========================================
  describe('Fake Test Double Demonstration', () => {
    // FAKE: Một bản cài đặt thực sự hoạt động nhưng được đơn giản hóa đi rất nhiều so với môi trường sản xuất.
    // Ví dụ phổ biến nhất là lưu dữ liệu trong bộ nhớ (In-memory array) thay vì kết nối CSDL MongoDB/SQL thật.
    class FakeUserRepository {
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

    it('should insert a user to the fake database and retrieve it later', async () => {
      const fakeDb = new FakeUserRepository();
      const dummyLogger = { log: () => {}, error: () => {} };
      const dummyEmailService = { sendWelcomeEmail: async () => true };

      const userService = new UserService(fakeDb, dummyEmailService, dummyLogger);

      // Thêm user thứ nhất
      const user1 = await userService.registerUser('John Doe', 'john@example.com', 'pwd123');
      expect(fakeDb.users.length).toBe(1);

      // Kiểm tra xem FakeUserRepository có hoạt động chuẩn xác bằng cách đăng ký trùng email
      await expect(
        userService.registerUser('John Mock', 'john@example.com', 'pwd456')
      ).rejects.toThrow('Email đã được đăng ký');
    });
  });

  // ==========================================
  // 3. STUB DEMONSTRATION
  // ==========================================
  describe('Stub Test Double Demonstration', () => {
    // STUB: Cung cấp các câu trả lời cố định (hardcoded) có sẵn khi được gọi.
    // Thường dùng để ép kịch bản đi vào các luồng ngoại lệ hoặc logic đặc thù (ví dụ: mô phỏng lỗi mạng, email tồn tại).

    it('should throw an error if the user repository stub returns an existing user', async () => {
      // STUB trả về dữ liệu người dùng đã tồn tại
      const stubUserRepositoryWithExistingUser = {
        findByEmail: async (email) => {
          return { id: '999', name: 'Existing User', email: 'duplicate@example.com' };
        },
        save: async () => {
          throw new Error('Hàm save() không được phép chạy khi trùng email!');
        }
      };

      const dummyLogger = { log: () => {}, error: () => {} };
      const dummyEmailService = { sendWelcomeEmail: async () => true };

      const userService = new UserService(
        stubUserRepositoryWithExistingUser,
        dummyEmailService,
        dummyLogger
      );

      // Thực hiện đăng ký và kiểm chứng xem nó có ném ra lỗi trùng email như thiết kế của Stub không
      await expect(
        userService.registerUser('New User', 'duplicate@example.com', 'password')
      ).rejects.toThrow('Email đã được đăng ký');
    });
  });

  // ==========================================
  // 4. MOCK DEMONSTRATION
  // ==========================================
  describe('Mock Test Double Demonstration', () => {
    // MOCK: Đối tượng được lập trình sẵn các kỳ vọng (expectations). 
    // Chúng ta không chỉ cấu hình giá trị trả về cho mock, mà còn kiểm chứng (assert) xem:
    // - Phương thức có được gọi hay không?
    // - Được gọi bao nhiêu lần?
    // - Các tham số truyền vào có chính xác như thiết kế hay không?

    it('should verify that EmailService is called exactly once with correct parameters', async () => {
      // Tự xây dựng MockEmailService thủ công để hiểu bản chất
      const mockEmailService = {
        callCount: 0,
        lastCalledEmail: null,
        lastCalledName: null,
        async sendWelcomeEmail(email, name) {
          this.callCount++;
          this.lastCalledEmail = email;
          this.lastCalledName = name;
          return true;
        }
      };

      const fakeDb = {
        users: [],
        async findByEmail(email) { return null; },
        async save(user) { this.users.push(user); return user; }
      };
      const dummyLogger = { log: () => {}, error: () => {} };

      const userService = new UserService(fakeDb, mockEmailService, dummyLogger);

      // Chạy tính năng đăng ký
      await userService.registerUser('Sarah Connor', 'sarah@skynet.com', 'no_fate');

      // VERIFICATION (Xác minh hành vi - Điểm khác biệt lớn nhất của Mock)
      expect(mockEmailService.callCount).toBe(1); // Gửi email đúng 1 lần
      expect(mockEmailService.lastCalledEmail).toBe('sarah@skynet.com'); // Đúng email đăng ký
      expect(mockEmailService.lastCalledName).toBe('Sarah Connor'); // Đúng tên đăng ký
    });

    it('should verify behavior using Jest builtin Mocking system', async () => {
      // Ví dụ sử dụng cơ chế Mocking tích hợp của Jest (jest.fn())
      const mockSendEmail = jest.fn().mockResolvedValue(true);
      const mockEmailService = {
        sendWelcomeEmail: mockSendEmail
      };

      const fakeDb = {
        async findByEmail() { return null; },
        async save() {}
      };
      const dummyLogger = { log: () => {} };

      const userService = new UserService(fakeDb, mockEmailService, dummyLogger);
      await userService.registerUser('John Connor', 'john@resistance.com', 'save_sarah');

      // Kiểm chứng bằng cú pháp Jest matchers
      expect(mockSendEmail).toHaveBeenCalledTimes(1);
      expect(mockSendEmail).toHaveBeenCalledWith('john@resistance.com', 'John Connor');
    });
  });

});
