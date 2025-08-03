export const declarations = [
  {
    id: 'BB123123',
    importer: { number: '20005264' },
    exporter: { number: '21667417' },
    finance: null,
    billNumber: 'BB123123',
    packages: {
      pkgCount: '850',
      pkgType: 'BX',
      grossWt: '100',
      grossWtUnit: 'LB',
      grossVol: '78.50',
      grossVolUnit: 'CF',
      contents: 'Test Content',
      categoryOfGoods: '1',
    },
    valuation: {
      currency: 'USD',
      netCost: '4000.00',
      netInsurance: '100.00',
      netFreight: '100.00',
      termsOfDelivery: 'FOB',
    },
    items: [], // This will hold the tariffs for this declaration
    moneyDeclaredFlag: 'N',
  },
  {
    id: 'CC123',
    importer: { number: '20005264' },
    exporter: { number: '21667417' },
    finance: null,
    billNumber: 'CC123',
    packages: {
      pkgCount: '900',
      pkgType: 'CT',
      grossWt: '150',
      grossWtUnit: 'KG',
      grossVol: '85.00',
      grossVolUnit: 'CF',
      contents: 'More Test Content',
      categoryOfGoods: '2',
    },
    valuation: {
      currency: 'EUR',
      netCost: '8000.00',
      netInsurance: '150.00',
      netFreight: '120.00',
      termsOfDelivery: 'CIF',
    },
    items: [], // This will hold the tariffs for this declaration
    moneyDeclaredFlag: 'N',
  },
];