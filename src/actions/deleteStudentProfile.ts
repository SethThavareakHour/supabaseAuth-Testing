export async function deleteStudentProfile(userId: any) {
  try {
    const response = await fetch(`/api/student-profile/${userId}`, {
      method: "DELETE",
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      status: "error",
      message: (error as Error).message,
    };
  }
}
