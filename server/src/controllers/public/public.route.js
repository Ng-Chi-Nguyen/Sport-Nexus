export const getHomePageController = (req, res) => {
    return res.status(200).json({ 
        message: 'Trang Chủ',
    });
}