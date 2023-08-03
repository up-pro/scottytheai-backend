export const getCurrentDate = () => {
  let currentMoment = new Date();
  let dd = String(currentMoment.getDate()).padStart(2, "0");
  let mm = String(currentMoment.getMonth() + 1).padStart(2, "0"); //January is 0!
  let yyyy = currentMoment.getFullYear();

  return `${yyyy}-${mm}-${dd}`;
};
