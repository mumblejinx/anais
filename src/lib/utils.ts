export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result?.toString().split(',')[1];
      if (base64String) {
        resolve(base64String);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
}

export function cn(...classes: (string | undefined | null | boolean | { [key: string]: boolean })[]) {
  return classes
    .filter(Boolean)
    .map((c) => {
      if (typeof c === 'object') {
        return Object.entries(c!)
          .filter(([_, value]) => value)
          .map(([key]) => key)
          .join(' ');
      }
      return c;
    })
    .join(' ');
}
