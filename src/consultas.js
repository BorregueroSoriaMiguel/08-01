//Importa total de la venta.
db.ventas.aggregate(
    [
      {
        $group:
            {
              _id:null,
              
              importe_total: { $sum: { $multiply: [ "$precios.precio_ud","$ud_vendidas" ] } }
            }
      }
    ]
 )
//Beneficios.
 db.ventas.aggregate(
    [
      {
        $group:
            {
              _id:null,

              importe_total: { $sum: { $multiply: [ "$precios.precio_ud","$ud_vendidas" ] } },
              precio_ud_compra_empresa: { $sum:  "$precios.precio_ud_compra_empresa" }
            }
      },
      {
        $addFields:
        {
          beneficios: { $subtract: [ "$importe_total" , "$precio_ud_compra_empresa" ] }
        }
      }
    ]
 )
//Mejores cliente.
db.ventas.aggregate(
  [
    {
      $match:
          { 
            ud_vendidas: { $gte: 5 }
          }
    },
    {
      $group:
          {
            _id:"$cliente",
            Unidades_compradas_por_el_cliente: { $max: "$ud_vendidas" }
          }
    },
    {
      $sort:
      {
        Unidades_compradas_por_el_cliente:-1
      }
    }
  ]
)
//Mejores vendedores.
db.ventas.aggregate(
  [
    {
      $match:
          { 
            ud_vendidas: { $gte: 5 },
          }
    },
    {
      $group:
          {
            _id:"$vendedor",
            Unidades_vendidas_por_el_vendedor: { $max: "$ud_vendidas" }
          }
    },
    {
      $sort:
      {
        Unidades_vendidas_por_el_vendedor:-1
      }
    }
  ]
)
//Mejores artículos.
db.ventas.aggregate(
  [
    {
      $match:
          { 
            ud_vendidas: { $gt: 8 }
          }
    },
    {
      $group:
          {
            _id:"$articulo_vendido",
          }
    },
  ]
)
//Mejor mes de ventas de 2020.
db.ventas.aggregate(
  [
    {
      $match:
          { 
            ud_vendidas: { $gt: 10 }
          }
    },
    {
      $project:
          {
            mejor_mes: { $month: "$fecha_venta" },
          }
    }
  ]
)
//Media de artículos vendidos al día durante el mejor mes de ventas de 2020.
comiezo_nov = new Date("2020,11,01")
final_nov = new Date("2020,11,30")
db.ventas.aggregate(
  [
    {
      $match:
          { 
            fecha_venta: {$gt: comiezo_nov, $lt: final_nov}
          }
    },
    {
      $group:
          {
            _id:null,
            tipos_articulos_vendidos_nov: { $sum :1 },
            num_articulos_vendidos_nov: { $sum: { $multiply: [ "$ud_vendidas", 12 ] } },
          }
    },
    {
      $addFields:
      {
        media_articulos_vendidos_cada_dia_nov: { $divide: [ "$num_articulos_vendidos_nov",30 ] }
      }
    }
  ]
)
//Media de los precios de los artículos de la tienda de Enrique Lomana Menudo y Francisco García Porcelana.
db.ventas.aggregate(
  [
    {
      $match:
          { 
          $or: [ { vendedor:"Enrique Lomana Menudo"}, { vendedor:"Francisco García Porcelana" } ]
          }
    },
    {
      $group:
          {
            _id:null,
            media_precio_articulos: { $avg: "$precios.precio_ud" },
          }
    }
  ]
)