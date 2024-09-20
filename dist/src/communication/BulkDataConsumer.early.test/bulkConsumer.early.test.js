"use strict";
// Unit tests for: bulkConsumer
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ProfileDataConsumer_1 = __importDefault(require("../Consumer/ProfileDataConsumer"));
const BulkDataConsumer_1 = __importDefault(require("../BulkDataConsumer"));
jest.mock("../Consumer/ProfileDataConsumer");
describe('bulkConsumer() bulkConsumer method', () => {
    let mockInit;
    let mockAuthProfileUpdation;
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
        // Mock the methods of ProfielDataConsumer
        mockInit = jest.fn();
        mockAuthProfileUpdation = jest.fn();
        // Mock the implementation of ProfielDataConsumer
        ProfileDataConsumer_1.default.mockImplementation(() => {
            return {
                _init_: mockInit,
                authProfileUpdation: mockAuthProfileUpdation,
            };
        });
    });
    describe('Happy Path', () => {
        it('should initialize and call authProfileUpdation successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange: Set up the mock to resolve successfully
            mockInit.mockResolvedValueOnce(undefined);
            // Act: Call the bulkConsumer function
            yield (0, BulkDataConsumer_1.default)();
            // Assert: Ensure _init_ and authProfileUpdation were called
            expect(mockInit).toHaveBeenCalledTimes(1);
            expect(mockAuthProfileUpdation).toHaveBeenCalledTimes(1);
        }));
    });
    describe('Edge Cases', () => {
        it('should handle errors thrown by _init_ gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange: Set up the mock to throw an error
            mockInit.mockRejectedValueOnce(new Error('Initialization error'));
            // Act: Call the bulkConsumer function
            yield (0, BulkDataConsumer_1.default)();
            // Assert: Ensure _init_ was called and authProfileUpdation was not called
            expect(mockInit).toHaveBeenCalledTimes(1);
            expect(mockAuthProfileUpdation).not.toHaveBeenCalled();
        }));
        it('should handle errors thrown by authProfileUpdation gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange: Set up the mocks
            mockInit.mockResolvedValueOnce(undefined);
            mockAuthProfileUpdation.mockImplementationOnce(() => {
                throw new Error('Auth profile update error');
            });
            // Act: Call the bulkConsumer function
            yield (0, BulkDataConsumer_1.default)();
            // Assert: Ensure both _init_ and authProfileUpdation were called
            expect(mockInit).toHaveBeenCalledTimes(1);
            expect(mockAuthProfileUpdation).toHaveBeenCalledTimes(1);
        }));
    });
});
// End of unit tests for: bulkConsumer
