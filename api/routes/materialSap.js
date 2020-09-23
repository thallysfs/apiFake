module.exports = app => {
    const controller = app.controllers.materialSap;

    app.route('/sap/bc/rest/YAPI_STAND_CRIA_MAT/rfcs')
        .get(controller.listMaterial)
        .post(controller.saveMaterial);

    app.route('/sap/bc/rest')
        .get(controller.returnToken);

}