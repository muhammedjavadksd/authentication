
// Unit tests for: bulkConsumer

import ProfielDataConsumer from '../Consumer/ProfileDataConsumer';

import bulkConsumer from '../BulkDataConsumer';



jest.mock("../Consumer/ProfileDataConsumer");

describe('bulkConsumer() bulkConsumer method', () => {
    let mockInit: jest.Mock;
    let mockAuthProfileUpdation: jest.Mock;

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Mock the methods of ProfielDataConsumer
        mockInit = jest.fn();
        mockAuthProfileUpdation = jest.fn();

        // Mock the implementation of ProfielDataConsumer
        (ProfielDataConsumer as jest.Mock).mockImplementation(() => {
            return {
                _init_: mockInit,
                authProfileUpdation: mockAuthProfileUpdation,
            };
        });
    });

    describe('Happy Path', () => {
        it('should initialize and call authProfileUpdation successfully', async () => {
            // Arrange: Set up the mock to resolve successfully
            mockInit.mockResolvedValueOnce(undefined);

            // Act: Call the bulkConsumer function
            await bulkConsumer();

            // Assert: Ensure _init_ and authProfileUpdation were called
            expect(mockInit).toHaveBeenCalledTimes(1);
            expect(mockAuthProfileUpdation).toHaveBeenCalledTimes(1);
        });
    });

    describe('Edge Cases', () => {
        it('should handle errors thrown by _init_ gracefully', async () => {
            // Arrange: Set up the mock to throw an error
            mockInit.mockRejectedValueOnce(new Error('Initialization error'));

            // Act: Call the bulkConsumer function
            await bulkConsumer();

            // Assert: Ensure _init_ was called and authProfileUpdation was not called
            expect(mockInit).toHaveBeenCalledTimes(1);
            expect(mockAuthProfileUpdation).not.toHaveBeenCalled();
        });

        it('should handle errors thrown by authProfileUpdation gracefully', async () => {
            // Arrange: Set up the mocks
            mockInit.mockResolvedValueOnce(undefined);
            mockAuthProfileUpdation.mockImplementationOnce(() => {
                throw new Error('Auth profile update error');
            });

            // Act: Call the bulkConsumer function
            await bulkConsumer();

            // Assert: Ensure both _init_ and authProfileUpdation were called
            expect(mockInit).toHaveBeenCalledTimes(1);
            expect(mockAuthProfileUpdation).toHaveBeenCalledTimes(1);
        });
    });
});

// End of unit tests for: bulkConsumer
