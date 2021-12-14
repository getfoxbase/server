import parseQuery from '../tools/query'

const ret = parseQuery({
  query: { fields: 'field1,foo(test,test2(ok,foo,bar))))' }
})

console.log(JSON.stringify(ret.filter, null, 4))
