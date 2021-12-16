import BooleanType from './Boolean'
import DateType from './Date'
import DecimalType from './Decimal'
import FloatType from './Float'
import I18nTextType from './I18nText'
import IntegerType from './Integer'
import LatLngType from './LatLng'
import OneToMany from './OneToMany'
import OneToOne from './OneToOne'
import TextType from './Text'

export default {
  boolean: BooleanType,
  date: DateType,
  decimal: DecimalType,
  float: FloatType,
  'i18n-text': I18nTextType,
  integer: IntegerType,
  latlng: LatLngType,
  text: TextType,
  'one-to-one': OneToOne,
  'one-to-many': OneToMany
}
