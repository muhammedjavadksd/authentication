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
// bulkConsumer.test.ts
// bulkConsumer.test.ts
jest.mock("../Consumer/ProfileDataConsumer");
describe('bulkConsumer() bulkConsumer method', () => {
    let mockInit;
    let mockAuthProfileUpdation;
    beforeEach(() => {
        mockInit = jest.fn();
        mockAuthProfileUpdation = jest.fn();
        // Mock the methods of ProfielDataConsumer
        ProfileDataConsumer_1.default.mockImplementation(() => {
            return {
                _init_: mockInit,
                authProfileUpdation: mockAuthProfileUpdation,
            };
        });
    });
    describe('Happy Path', () => {
        it('should initialize and call authProfileUpdation successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockInit.mockResolvedValueOnce(undefined);
            // Act
            yield (0, BulkDataConsumer_1.default)();
            // Assert
            expect(mockInit).toHaveBeenCalledTimes(1);
            expect(mockAuthProfileUpdation).toHaveBeenCalledTimes(1);
        }));
    });
    describe('Edge Cases', () => {
        it('should handle error during initialization gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockInit.mockRejectedValueOnce(new Error('Initialization Error'));
            // Act
            yield (0, BulkDataConsumer_1.default)();
            // Assert
            expect(mockInit).toHaveBeenCalledTimes(1);
            expect(mockAuthProfileUpdation).not.toHaveBeenCalled();
        }));
        it('should handle error during authProfileUpdation gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockInit.mockResolvedValueOnce(undefined);
            mockAuthProfileUpdation.mockImplementationOnce(() => {
                throw new Error('Auth Profile Updation Error');
            });
            // Act
            yield (0, BulkDataConsumer_1.default)();
            // Assert
            expect(mockInit).toHaveBeenCalledTimes(1);
            expect(mockAuthProfileUpdation).toHaveBeenCalledTimes(1);
        }));
    });
});
// End of unit tests for: bulkConsumer
