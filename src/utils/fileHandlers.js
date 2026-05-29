/**
 * Create a data URL from a file
 * @param {File} file - The file to convert
 * @returns {Promise<string>} Data URL
 */
export const fileToDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Validate file type
 * @param {File} file - The file to validate
 * @param {string[]} allowedTypes - Allowed MIME types
 * @returns {boolean} Is valid file type
 */
export const isValidFileType = (file, allowedTypes = ["image/jpeg", "image/png"]) => {
  return allowedTypes.includes(file.type);
};

/**
 * Validate file size
 * @param {File} file - The file to validate
 * @param {number} maxSizeMB - Max size in MB
 * @returns {boolean} Is valid file size
 */
export const isValidFileSize = (file, maxSizeMB = 5) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Upload file to server
 * @param {File} file - The file to upload
 * @param {string} endpoint - API endpoint
 * @returns {Promise<Response>} Server response
 */
export const uploadFile = async (file, endpoint) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  return response;
};
