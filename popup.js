function sorter(array) {
  return Object.keys(array).sort((a, b) => {
    return array[a] <= array[b];
  });
}
