const BASE_URL = 'https://www.higgsinno.com/'
const header = {
  'content-type': 'application/json'
}

export const request = (option) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + option.url,
      method: option.method || 'GET',
      header: {
        ...header,
        ...option.header
      },
      data: option.data,
      success(res) {
        if(res.statusCode !== 200) {
          reject(res.msg)
        } else {
          console.log(res);
          resolve(res.data)
        }
      },
      fail(err) {
        console.log('err', err);
      }
    })
  })
}
