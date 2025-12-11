import prisma from "../../db/prisma.js";

const brandService = {
    createBrand: async (brandData) => {
        let { name, origin, logo } = brandData;
        let newBrand = await prisma.Brands.create({
            data: {
                name: name,
                origin: origin,
                logo: logo
            },
            select: {
                id: true,
                name: true,
                origin: true,
                logo: true
            }
        })

        return newBrand;
    }
}

export default brandService;