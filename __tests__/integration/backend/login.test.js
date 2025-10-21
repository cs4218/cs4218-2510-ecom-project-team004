import userModel from "../../../models/userModel";

const newUser = {
  name: "registration tester",
  email: "registration@test.com",
  password: "pw",
  phone: "98765432",
  address: "123 ABC Street",
  answer: "testing",
};

describe("Login", () => {
  test("user can login", async () => {
    // fake test to check configuration
    const exisitingUser = await userModel.findOne({ email: newUser.email });

    expect(exisitingUser).toBeNull();
  });
});
